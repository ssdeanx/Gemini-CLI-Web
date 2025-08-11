# Chat: Slash Commands and Tool-Use Feedback (Migration Plan)

Goal: add first-class support for `/` commands in chat and show live tool calls (CLI-like) for ALL tools in the chat transcript, without breaking existing behavior.

Scope: documentation-only plan. No code edits here. Changes must be additive, behind safe checks, and align with existing contracts.

---

## 1) Current Chat Architecture (as-is)

- __Transport__
  - WebSocket at `/ws?token=<JWT>` set up in `server/index.js` within `handleChatConnection()`.
  - Frontend connects via `src/utils/websocket.js` after `GET /api/config`.

- __Sessions__
  - `server/sessionManager.js` stores sessions in memory and on disk under `~/.gemini/sessions/`.
  - `getSessionMessages()` returns messages for UI; `buildConversationContext()` builds small text context.

- __Gemini CLI driver__
  - `server/gemini-cli.js` `spawnGemini(command, options, ws)` shells out to Gemini CLI, streams stdout/stderr to clients via WS events (e.g., `gemini-output`, `gemini-error`, `session-created`, `session-updated`).

- __Frontend surface__
  - `src/components/ChatInterface.jsx` renders chat messages; has toggles like `autoExpandTools` and some <details> blocks.
  - `src/components/ui/ToolUseFeedback.jsx` can render an inline “tool-use message” if provided a message shaped like `{ isToolUse, toolName, toolInput, toolResult, toolError, toolResultTimestamp }`.
  - `src/components/EditorTab.jsx` forwards `onFileOpen` into chat sidebar for file-deep-links.
  - `src/components/Sidebar.jsx` deals with projects/sessions lists; no deep coupling to chat events.
  - `src/components/ToolsSettings.jsx` configures tools/MCP; not directly part of chat loop but relevant for which tools can be used.

---

## 2) Target Capabilities

- __Slash commands__
  - Users type `/command args` in chat input; the system interprets them as structured actions.
  - Examples (extensible): `/help`, `/abort`, `/read <absPath>`, `/write <absPath> <content>`, `/tool <name> <json>`.
  - Important: absolute-path enforcement for file ops; reject unsafe/relative paths.

- __Tool-use feedback in transcript (ALL tools)__
  - When any tool is invoked (slash/internal ops, MCP tools, model-detected tools, server-side utilities like git, web fetch/search), emit structured events so the UI can render via `ToolUseFeedback.jsx`:
    - `tool-use-start`: `{ toolName, input }`
    - `tool-use-result`: `{ toolName, result }`
    - `tool-use-error`: `{ toolName, error }`

- __Non-breaking__
  - All new messages and events are additive (unknown message types must be ignored by older clients).
  - Behind flags where helpful; maintain current chat loop if slash handling is disabled.

---

## 3) Message/Event Schemas (WebSocket)

Server → Client (all authenticated):

- `session-created` | `session-updated` | `gemini-output` | `gemini-error` (existing)
- __NEW (generic for ALL tools):__
  - `tool-use-start`:
    - Payload: `{ type: 'tool-use-start', sessionId, toolName, toolInput, timestamp }`
  - `tool-use-result`:
    - Payload: `{ type: 'tool-use-result', sessionId, toolName, toolResult, timestamp }`
  - `tool-use-error`:
    - Payload: `{ type: 'tool-use-error', sessionId, toolName, toolResult, toolError: true, timestamp }`

Client → Server:

- `chat` (existing): `{ type: 'chat', sessionId, projectName, message }`
- __NEW:__ `slash`:
  - `{ type: 'slash', sessionId, projectName, command: string, args: string }`
  - Keep a single structured envelope; server parses `command` and `args`.

Notes:
- Unknown `type` fields must be ignored gracefully by both sides.
- Include `sessionId` for routing and persistence.

---

## 4) Frontend Plan (surgical)

Files: `src/components/ChatInterface.jsx`, `src/components/ui/ToolUseFeedback.jsx`, `src/utils/websocket.js`, `src/components/EditorTab.jsx`.

- __Slash command detection (input layer)__
  - In `ChatInterface.jsx`, when user submits, if input starts with `/`, send WS message with `{ type: 'slash', command, args }` instead of normal chat.
  - Keep current path for non-slash messages.
  - Do not change HTTP APIs.

- __Render tool-use entries (ALL tools)__
  - In WS message handler (likely in parent that pushes to `messages`), when receiving `tool-use-*` events from ANY tool, map them into chat messages with the `ToolUseFeedback` shape:
    - `{ isToolUse: true, toolName, toolInput: JSON.stringify(input), toolResult, toolError }`.
  - Pass these to existing `MessageComponent` branch that renders `ToolUseFeedback`.

- __File open integration__
  - `ToolUseFeedback` already supports `onFileOpen(path)`; ensure ChatInterface passes it through so `/read` and write/edit results can offer quick-open.

- __Flags/UX__
  - Use existing `autoExpandTools` to default-open tool details.
  - Optional setting in Quick Settings: “Enable slash commands” (read-only docs; actual switch lives in UI if desired later).

Compatibility: if server doesn’t emit `tool-use-*`, UI ignores and continues with existing rendering.

---

## 5) Server Plan (surgical)

Files: `server/index.js`, `server/gemini-cli.js`, `server/sessionManager.js`.

- __WS input routing__ (`handleChatConnection` in `server/index.js`)
  - On receiving messages, branch on `type`:
    - `chat`: existing behavior (calls `spawnGemini` with `--prompt`)
    - __NEW__ `slash`: parse `command` and `args` → dispatch to safe handlers.

- __Slash dispatcher__ (examples)
  - `/help` → send list of supported commands to client as a normal assistant message.
  - `/abort` → call `abortGeminiSession(sessionId)`.
  - `/read <absPath>` → validate absolute path; read file; emit `tool-use-start`(toolName: "read"); send result via `tool-use-result` with snippet; append assistant summary message; persist to session.
  - `/write <absPath> <content>` → validate and write; emit start/result; persist.
  - `/tool <name> <json>` → generic hook to call an MCP tool (future: via canonical `~/.gemini/settings.json`), emitting start/result.

- __Tool-use event emission (ALL tools)__
  - Add small helpers to emit `tool-use-start/result/error` over WS for the correct `sessionId`.
  - Emit for:
    - Slash/internal tools: `/read`, `/write`, `/abort`, custom ops.
    - MCP tools (when invoked): read `~/.gemini/settings.json` to resolve and execute.
    - Model-detected tool blocks (if parseable from CLI/stdout): best-effort parse and emit events.
    - Server-side utilities (git operations, web fetch/search) when executed within chat flow.
  - If Gemini CLI output lacks structure, emit at least for slash/internal and MCP paths.

---

## 5.1) Tool Universe and Mapping to UI

- __Sources of tool calls__
  - Slash/internal commands: `/read`, `/write`, `/abort`, future `/bash`, `/grep`, etc.
  - MCP tools: configured in `~/.gemini/settings.json`.
  - Model-detected tools: parsed from Gemini CLI output when possible.
  - Server utilities: git actions, web fetch/search performed in chat context.

- __toolName conventions (to align with `ToolUseFeedback.jsx`)__
  - `bash` → renders command + result (`renderBash`)
  - `read` / `read_file` / `readfile` → renders path and preview (`renderRead`)
  - `write` / `replace` / `edit` / `multiedit` → renders file change summary (`renderWriteReplaceEdit`)
  - `todowrite` / `todoread` → renders TODO-oriented ops
  - `webfetch` / `websearch` → renders web ops (`renderWebTool`)
  - `glob` / `grep` / `task` / `readmanyfiles` → falls back to generic renderer
  - Others default to generic renderer (`renderGeneric`)

- __Event payload tips__
  - Prefer `toolInput` as a compact JSON string; keep large results in `toolResult` with previewing handled by UI.
  - Include `toolResultTimestamp` if available for header timestamp.

- __Persistence__ (`server/sessionManager.js`)
  - When tool-use events occur, also append a compact assistant-side message to the session (e.g., `role: 'assistant'`, content summary). Optionally store a lightweight tool metadata object alongside.
  - Ensure `getSessionMessages()` surfaces a readable transcript (tool-use can be represented as messages of type `tool` if desired, but UI can reconstruct from events too).

Security:
- Enforce absolute paths on `/read`/`/write` and reject traversal.
- Respect JWT on WS (already done). Do not echo secrets in logs.

---

## 6) Slash Command Catalog (initial)

- `/help`
  - Returns a list of supported commands and usage examples.

- `/abort`
  - Aborts the current Gemini CLI process for the session.

- `/read /abs/path` (absolute only)
  - Reads file contents and returns a preview via `tool-use-result`.

- `/write /abs/path <content>`
  - Writes content to file; returns bytes written or a success summary.

- `/tool <name> <jsonInput>`
  - Calls a configured MCP tool by name (future phase); result is rendered as tool-use.

Notes:
- All arguments after the command are parsed conservatively (quote-aware parsing is recommended). Unknown commands reply with `/help`.

---

## 7) Non-Breaking Rollout Strategy

- Phase 1: Implement server-side slash dispatcher with `help`, `abort`, `read`, `write` + WS events. UI only detects slash input and renders tool-use events.
- Phase 2: Add `/tool` integrated with MCP settings in `~/.gemini/settings.json` (depends on MCP migration).
- Feature flags: allow turning off slash commands and tool-use visualization with env or UI toggle.

---

## 8) Verification Checklist

- __Auth__
  - WS requires `Authorization` at handshake (already enforced). Validate rejection path.

- __Slash__
  - `/help` returns catalog.
  - `/abort` cancels an active run via `abortGeminiSession()`.
  - `/read` on absolute path succeeds; relative path is rejected.
  - `/write` writes and shows a result; reject directories or disallowed locations as needed.

- __Tool-use UI__
  - On `tool-use-*` events, `ToolUseFeedback` renders with auto-expand obeying user setting.
  - File paths in results can be opened via `onFileOpen`.

- __Persistence__
  - `sessionManager` includes assistant messages summarizing tool actions.
  - `getSessionMessages()` returns a coherent transcript on refresh.

---

## 9) Contracts Summary

- WS inbound: `{ type: 'slash' | 'chat', sessionId, projectName, ... }`
- WS outbound: existing types + `tool-use-start|result|error` with payload fields listed above.
- No new HTTP endpoints required.
- MCP tool calls for `/tool` tie into canonical settings `~/.gemini/settings.json` (future phase).

---

## 10) Compatibility & Safety

- Additive changes only; unknown WS types ignored.
- Absolute path enforcement for file operations.
- No secrets in logs; redaction if any tool responses include sensitive headers/env.
- Keep all existing UI behavior if no `tool-use-*` events are received.

---

## 11) Next Steps (incremental)

- Implement Phase 1 server dispatcher + event emission.
- Wire ChatInterface to send `{ type: 'slash' }` when input starts with `/`.
- Map `tool-use-*` events to `ToolUseFeedback` messages.
- Add `/tool` once MCP migration lands (reads `~/.gemini/settings.json`).
