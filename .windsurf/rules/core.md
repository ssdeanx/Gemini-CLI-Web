---
trigger: always_on
---

# Core Rules (Always On)

- Activation: Always On
- Scope: Repository-wide
- Size budget: ≤ ~12k chars/file

These rules optimize agentic AI work on Gemini-CLI-Web. Keep instructions concise, specific, and runnable.

## Tool-Calling

- State why a tool is used; then call it immediately.
- Prefer full-file views on first open; batch read-only tools in parallel (grep/outline/dir/web).
- Do not fabricate APIs/paths; if unsure, search or inspect.

## Code Changes

- Apply minimal patches with 3 lines of stable context above/below each hunk.
- Keep code runnable after each edit (imports/exports/endpoints).
- Break large edits into small sequential patches (<300 lines each).
- Don’t paste large code in chat; use edit tools (or provide files for manual paste).

## Commands

- Treat commands as potentially unsafe; avoid destructive ops unless explicitly requested.
- Safe to run proactively: read-only commands (e.g., `git status -s`, `node -v`) and starting dev servers.
- Never `cd`; set CWD in the tool call. Limit verbose output (e.g., `git log -n 20`).

## Planning

- Maintain a living plan with Current Goal, Tasks, and Status.
- Update plan on new direction, major findings, or after substantial work.

## Memory

- Persist: architecture notes, decisions, route catalogs, component–API map, user preferences.
- Avoid: secrets/PII/tokens. Reference memories that inform actions.

## Debugging

- Reproduce before fixing; add targeted logs/tests to find root cause.
- Prefer minimal, reversible changes. Explain hypothesis and how you’ll verify.

## Docs & Testing

- Update [documentation/API/route-catalog.md](cci:7://file:///home/sam/Gemini-CLI/documentation/API/route-catalog.md:0:0-0:0) and [documentation/API/openapi.yaml](cci:7://file:///home/sam/Gemini-CLI/documentation/API/openapi.yaml:0:0-0:0) when endpoints change.
- Note env vars/ports in README if touched.
- Use lightweight integration checks in dev where beneficial.

## Web Server & Preview

- Dev: `npm run dev` starts Express API and Vite; Vite proxies `/api` and `/ws`.
- Only open Browser Preview after a local web server is running.

## Security & Secrets

- Never log/persist credentials, JWTs, API keys, or PII.
- Enforce absolute file paths for file APIs; do not weaken this.
- Validate project paths for git ops; keep error messages clear.

## Communication

- Be concise. Use headings and short bullets.
- Reference exact paths/symbols using backticks (e.g., [server/index.js](cci:7://file:///home/sam/Gemini-CLI/server/index.js:0:0-0:0), [src/utils/api.js](cci:7://file:///home/sam/Gemini-CLI/src/utils/api.js:0:0-0:0)).
- If blocked, say why and which info/tool is needed.

## Performance & Reliability

- Batch read-only ops; avoid redundant reads.
- After major actions, verify quickly (lint/build/dev run or targeted fetch).
- Keep initial JS reasonable; lazy-load heavy editors/panels.

## Repo Cross-Refs

- OpenAPI spec: [documentation/API/openapi.yaml](cci:7://file:///home/sam/Gemini-CLI/documentation/API/openapi.yaml:0:0-0:0) (source of truth).
- Routes catalog: [documentation/API/route-catalog.md](cci:7://file:///home/sam/Gemini-CLI/documentation/API/route-catalog.md:0:0-0:0).
- Frontend: `src/**/*`.
- Backend: `server/**/*`.