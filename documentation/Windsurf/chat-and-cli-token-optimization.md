# Chat & CLI Token Optimization (Non‑Breaking Plan)

Objective: reduce large language model (LLM) token consumption and improve responsiveness for both chat UI and Gemini CLI driver, while keeping auth secure and existing flows intact. Documentation-only; no code changes in this guide.

---

## 1) Current State (as-is)

- **Driver**: `server/gemini-cli.js` builds `--prompt` and shells out to Gemini CLI; streams stdout/stderr via WS.
- **Context**: `server/sessionManager.js#buildConversationContext(sessionId, maxMessages=10)` concatenates the last N chat turns into a plain-text preamble.
- **Chat UI**: `src/components/ChatInterface.jsx` renders messages; `src/components/ui/ToolUseFeedback.jsx` previews tool outputs with optional auto-expand.
- **WS**: `server/index.js#handleChatConnection()` handles chat; `src/utils/websocket.js` manages client connect.
- **Files**: `server/projects.js` fetches file trees/content; chat may request large file payloads.

---

## 2) Goals

- **Lower tokens sent in prompts** without losing necessary context.
- **Bound tool outputs** and large content in chat.
- **Keep auth secure** and fast (JWT/websocket), while not conflating with LLM tokens.

---

## 3) Chat: Prompt/Input Optimizations (LLM tokens)

- **Conversation windowing (already partially):**
  - Keep `maxMessages` small (e.g., 8–12). Summarize older turns instead of including verbatim.
  - Add a rolling summary string in `sessionManager` stored per session; update it when messages roll off the window. Then build context as: `[rollingSummary]\n\n[last-N turns]`.

- **System prompt minimization:**
  - If a system header is used, keep it static and brief; avoid repeating long instructions per turn.

- **Whitespace/markup trimming:**
  - Normalize multiple blank lines, collapse verbose logs in user input before prompt assembly.

- **File payload discipline:**
  - Prefer diffs/snippets over full files. In chat replies that include code, show minimal diff or focused region.
  - When a tool reads a file, preview the first N lines/bytes and provide an explicit “View full” affordance instead of pasting entire content into the model prompt.

- **Tool output bounding:**
  - In `ToolUseFeedback`, keep `toolResult` previews short (already supports `maxPreviewChars`). For model prompts, include only a compact summary of tool results, not the entire raw output.

- **Image constraints (CLI path):**
  - Downscale or reduce count of images included per prompt when possible. Prefer referencing paths and concise captions over embedding full text extractions.

---

## 4) CLI Invocation Optimizations (Driver-side)

- **Prompt construction:**
  - Keep `--prompt` concise. Avoid concatenating repetitive context; use the rolling summary pattern above.
  - If the CLI supports max output limits, prefer smaller outputs where appropriate (manual summarization on the UI can recover detail if needed). Do not assume flags that aren’t documented in this repo; treat limits as a behavioral guideline via prompt wording.

- **Early abort UX:**
  - Encourage users to `/abort` long generations; keep `abortGeminiSession(sessionId)` documented in the chat guide.

- **Chunking strategy (manual):**
  - For very large tasks, send multiple smaller prompts rather than a single giant one (reduces per-call token footprint and failure modes).

---

## 5) Server Responses & Tool-Use (Chat rendering)

- **Summarize for the model; expand for the user:**
  - When emitting tool-use events, attach a compact summary for the model prompt, but surface a clickable/expandable full result in the UI (`ToolUseFeedback`).

- **Consistent tool naming → specialized renderers:**
  - Use conventional names (`read`, `write`, `bash`, `webfetch`, `websearch`, `grep`, `glob`, etc.) so `ToolUseFeedback.jsx` chooses specialized, space-efficient layouts.

---

## 6) Caching & Reuse (Optional, additive)

- **Rolling summaries cache:**
  - Persist per-session rolling summaries in `~/.gemini/sessions/<id>.json` to avoid recomputing on restart.

- **Result memoization (UI only):**
  - Cache large tool outputs client-side keyed by `(sessionId, toolName, hash(toolInput))` to avoid resending in subsequent prompts.

---

## 7) Auth Tokens (non-LLM) – Safety & Performance

- **JWT lifetime & storage:**
  - Keep short-lived JWTs; renew via standard flows. Avoid logging or exposing tokens; continue using `Authorization: Bearer` for HTTP and `?token=` for WS.

- **No token echo:**
  - Never include JWTs in prompts or tool events. Redact headers/env in server logs and UI.

## 7a) Token Lifecycle (HTTP + WS)

- **Current**
  - Issue: `POST /api/auth/login`, `POST /api/auth/register` → `{ token, user }` (`server/routes/auth.js`).
  - Store: `localStorage['auth-token']` in `AuthContext` (`src/contexts/AuthContext.jsx`).
  - Attach: `Authorization: Bearer <token>` for HTTP via `authenticatedFetch` (`src/utils/api.js`).
  - WS: `GET /api/config` for `wsUrl`, then connect to `/ws?token=<JWT>` (`src/utils/websocket.js`).
  - Verify: `authenticateToken` middleware for HTTP; WS handshake validates `token` on server.

- **Gaps**
  - No client-side expiry/refresh handling; main JWT used for WS; no cross‑tab logout sync; some routers (e.g., `server/routes/git.js`) should enforce `authenticateToken` at router level.

- **Non‑breaking improvements**
  - Add `exp` to JWT and check on client; namespace token as `gemini-cli.auth.token`.
  - 401 handler in `authenticatedFetch` to force logout; add `storage` event listener for cross‑tab sync.
  - Optional: short‑lived WS token (`POST /api/auth/ws-token`) and use it in `?token=`.
  - Enforce `authenticateToken` in `server/routes/git.js`; standardize error schema/status codes.
  - Truncate/paginate large Git outputs (diffs/commits) to reduce payloads and LLM context bloat.

---

## 8) Non-Breaking Implementation Plan

- Phase 1 (safe defaults):
  - Add rolling summary in `sessionManager`; change `buildConversationContext()` to prefix with summary then last N messages.
  - Reduce default `maxMessages` if currently >10.
  - Ensure UI previews truncate large `toolResult` content by default; expose “view full” via details.

- Phase 2 (progressive):
  - Add optional input normalizer (trim whitespace/log spam) before sending to CLI.
  - Add simple heuristics: if user pastes >N lines, prompt them to summarize or split.

- Phase 3 (advanced, optional):
  - Add semantic retrieval to include only relevant file snippets instead of whole files (see `documentation/workflows/semantic-code-search.md`).

---

## 9) Verification Checklist

- Context token count drops: last-N turns + rolling summary stays well below model limits for typical sessions.
- Tool outputs in chat remain readable but truncated by default; full details available on demand.
- Long pastes are either summarized or chunked.
- No JWTs or secrets ever appear in prompts, logs, or tool payloads.

---

## 10) References

- Chat architecture: `server/index.js`, `server/gemini-cli.js`, `server/sessionManager.js`, `src/components/ChatInterface.jsx`, `src/components/ui/ToolUseFeedback.jsx`, `src/utils/websocket.js`.
- Tool-use events and slash commands: `documentation/Windsurf/chat-slash-commands-and-tooluse-guide.md`.
