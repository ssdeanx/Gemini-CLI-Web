# Windsurf Rules, Settings, and Workflows

These rules are optimized for an agentic AI workflow on Gemini-CLI-Web.
They codify safe tool use, code-edit hygiene, planning, debugging, research, and documentation standards.

Applies to this stack: React 18 + Vite, Node/Express, WebSocket, Tailwind, SQLite.

## 1) Tool-Calling Rules

- Do: Use tools when evidence is needed (read files, grep, list dirs, view outlines, web search, WS/browser preview).
- Do: State why a tool is being called; then call it immediately.
- Do: Prefer full-file views over partials when first opening a file.
- Do: Batch independent read-only actions in parallel.
- Don’t: Fabricate APIs/paths; if unsure, search/inspect.

## 2) Code-Change Rules

- Use code-edit tool with minimal patches; include 3 lines of stable context above/below each hunk.
- Include imports/exports and keep code runnable after each edit.
- Break large edits into smaller sequential patches (<300 lines each).
- Never output inline code in chat unless the user asks; apply via tool.
- Add/update README/docs when adding features or endpoints.

## 3) Command Execution Rules

- Treat commands as potentially unsafe; never auto-run destructive/mutating operations.
- Allowed to run proactively: read-only commands (e.g., `git status -s`, `node -v`) and starting dev servers.
- Never `cd`; set CWD explicitly in the tool call.
- Keep output limited (`git log -n 20`).

## 4) Research Rules (Web)

- Use the web search tool for up-to-date guidance.
- Prefer text-heavy, authoritative sources; read before summarizing.
- Cite the high-level source names/URLs in the summary (no direct links required if tool abstracts them).
- If research fails, proceed with principled defaults and note assumptions.

## 5) Planning Rules

- Maintain a living plan. Update the plan on: new user direction, major findings, or after substantial work.
- Plans should list current goal, tasks, and status (checked/unchecked).

## 6) Memory Rules

- Persist: architecture notes, decisions, API maps, route catalogs, user preferences.
- Avoid: transient details, secrets, or sensitive tokens.
- Reference memories that inform actions (e.g., “following the API map memory”).

## 7) Debugging Rules

- Reproduce before fixing. Add targeted logs/tests to isolate root cause.
- Prefer minimal, reversible changes. Explain the hypothesis and verification.
- When uncertain, propose an experiment and its expected outcomes.

## 8) Docs & Testing Rules

- For new endpoints/features, update `documentation/API/route-catalog.md` and add examples.
- Document env vars and ports in README if touched.
- Prefer lightweight integration checks for server APIs (fetch calls in dev) and minimal unit tests where beneficial.

## 9) Web Server & Preview Rules

- Dev: `npm run dev` launches Express (API) and Vite (client). Vite proxies `/api` and `/ws`.
- Only use browser preview after a local web server is running.
- Validate WS auth flow by calling `GET /api/config` first and connecting using `?token=`.

## 10) Security & Secrets

- Never log or persist credentials, JWTs, or API keys.
- Enforce absolute file paths for file APIs (already in server). Do not weaken this.
- Validate project paths for git operations; surface clear error messages.

## 11) Communication Style

- Be concise. Use headings and short bullet lists.
- Reference exact paths/symbols in backticks.
- If blocked, state why and what info/tool is needed.

## 12) Performance & Reliability

- Batch read-only operations; avoid redundant file reads.
- Defer expensive operations when the user wants quick feedback; note tradeoffs.

---

# Repository-Specific Workflows

## A) API Workflows

- When adding/changing routes in `server/index.js` or `server/routes/*.js`:
  1. Implement route and validations.
  2. Update `documentation/API/route-catalog.md` (method, path, request, response, errors).
  3. Add/adjust `src/utils/api.js` wrappers and consuming components.
  4. Dev-test via Vite proxy; verify auth headers.

## B) WebSocket Workflow

- When changing WS payloads in `server/index.js`:
  1. Update `src/utils/websocket.js` parsing and any consumers.
  2. Note message schema changes in `documentation/API/route-catalog.md` under WebSocket.

## C) Git Panel Workflow

- Endpoints live in `server/routes/git.js`. For changes:
  1. Keep robust error messages (network, upstream, conflicts, non-fast-forward).
  2. Ensure `GitPanel.jsx` handlers match responses.
  3. Document new statuses/fields.

## D) Auth Workflow

- If auth changes:
  1. Update `src/utils/api.js` auth methods.
  2. Confirm `ProtectedRoute`, `AuthContext` flows.
  3. Document token expectations and expiry in README.

---

# Checklists

## PR Checklist

- [ ] Code compiles; `npm i && npm run build` passes.
- [ ] New/changed routes documented in `documentation/API/route-catalog.md`.
- [ ] Security implications reviewed (auth, file paths, git operations).
- [ ] Minimal tests/logging for critical paths.
- [ ] User-facing copy and errors concise and helpful.

## Session Checklist (AI)

- [ ] Plan updated
- [ ] Memories saved when appropriate
- [ ] Tools justified and used efficiently
- [ ] Patches minimal with correct context
- [ ] Docs updated if routes/features changed

---

# Local Commands (reference)

- Install: `npm i`
- Dev: `npm run dev`
- Build: `npm run build`
- Start (prod): `npm start`

# Notes

- Vite port and proxy are configured in `vite.config.js`. Default API port 4008, Vite 4009.
- WebSocket path is `/ws` with token query parameter.

---

## Advanced Best Practices (2025)

## Agentic Loops & Parallelism

- Always form a brief loop: Plan → Gather Evidence (tools) → Act (edits/commands) → Verify → Document.
- Aggressively batch independent read-only tools (grep, outline, dir, web) in parallel; never parallelize writes.
- After each major action, verify with quick checks (lint/build/dev run or targeted fetch).

## Schema-First API

- Treat `documentation/API/openapi.yaml` as source of truth; update spec with every API change.
- Validate request/response shapes in code against spec (light integration checks in dev).
- Derive client helpers in `src/utils/api.js` from the spec; keep errors descriptive.

## Prompt Hygiene & Safety

- Keep instructions concise; avoid ambiguous pronouns; cite exact paths and symbols.
- Redact or avoid echoing secrets/JWTs/PII in logs, patches, and docs.
- If uncertain, state assumptions and propose a low-risk experiment.

## Telemetry (Dev Diagnostics)

- Favor structured logs (JSON-ish objects) with event, path, project, and error details on the server.
- Gate verbose logs behind `NODE_ENV!=='production'` or env flags.

## Reliability & WS Resilience

- Maintain reconnect with jittered backoff in `src/utils/websocket.js`; cap retries and surface status in UI when applicable.
- Validate token via `GET /api/config` before connecting; handle auth expiry gracefully (prompt re-login).

## PWA Caching & Versioning

- Bust caches on deploy by versioning assets; ensure service worker updates promptly and informs user to reload.
- Avoid caching authenticated API responses unless explicitly safe.

## Performance Budgets

- Frontend: keep initial JS under reasonable budget; lazy-load heavy editors or panels.
- Backend: avoid blocking I/O on large git ops; stream where possible; cap payload sizes.

## CI / Quality Gates

- On PRs: `npm i`, lint, build, and validate `openapi.yaml` (schema check). Fail fast on route/spec drift.
- Require route-catalog and spec updates for API changes.

## Test Scaffolding

- Add minimal integration checks for critical endpoints (auth, files, git status) using dev server fetches.
- Prefer targeted test helpers over heavy frameworks at this stage.

## Commit Automation

- Use the Git panel endpoints for structured messages; prefer scope + summary (e.g., `feat(api): add pull errors`).
- When multiple files, auto-summarize but keep messages human-auditable.

## Migrations & Deprecations

- Announce breaking changes in `README.md` and `route-catalog.md`; provide migration notes and fallback behavior.
- Keep old endpoints temporarily with warnings when feasible; remove in a scheduled release.

## Ops Playbooks

- Common failures: git remote missing, network errors, merge conflicts, path validation. Provide actionable UI messages and server hints.
- Document recovery steps in `documentation/` (e.g., resolving conflicts, adding remotes).
