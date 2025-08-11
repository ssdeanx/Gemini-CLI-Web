---
trigger: always_on
---

# Security Rules (Always On)

- Activation: Always On
- Scope: Repository-wide (frontend `src/**`, backend `server/**`, docs)
- Size budget: ≤ ~12k chars/file

Security is everyone’s job. Default to least privilege, explicit validation, and clear, non-sensitive errors.

## AuthN/Z

- All protected HTTP endpoints must require `Authorization: Bearer <token>`. Verify on server.
- WebSocket connects via `/ws?token=<JWT>`; validate token at handshake and on reconnect.
- Never echo tokens in logs, commit messages, PRs, or UI. Mask if unavoidable.
- Enforce role/scope checks server-side for sensitive operations (git, filesystem).

## Secrets & PII

- Never log credentials, API keys, JWTs, or PII. Redact on server logs and UI toasts.
- Keep secrets out of VCS; reference via env vars and document in [README.md](cci:7://file:///home/sam/Gemini-CLI/README.md:0:0-0:0) (no values).
- Avoid storing tokens in localStorage if possible; if used, namespace, rotate, and clear on logout.

## Filesystem Safety

- File APIs must use absolute paths. Do not accept relative traversal (e.g., `..`).
- Normalize and validate paths on server; restrict to allowed project roots.
- Return precise but non-revealing errors (e.g., “invalid path” instead of full filesystem paths).

## Git Operations

- Validate project path and repo state before running git commands.
- Surface actionable errors without leaking sensitive environment details.
- For push/pull, handle network/credentials/fast-forward conflicts gracefully; do not dump full remotes.

## Input Validation

- Validate all request bodies, query params, and headers (shape + type + bounds).
- Prefer schema-first contracts; reject unknown fields. Sanitize strings for logs/UI.

## Transport & Browser

- Prefer HTTPS in production for both API and WS.
- Set CORS deliberately (origins, headers, methods). Avoid `*` in production.
- Avoid caching authenticated responses; control via headers and service worker logic.

## Logging & Diagnostics

- Use structured logs on server with event, path, project, and error codes.
- Gate verbose logs behind `NODE_ENV !== 'production'` or flags.
- Never log file contents, secrets, or large diffs by default.

## Dependency & Supply Chain

- Pin or range-pin critical deps; document upgrade flow.
- Run security scans periodically; track advisories and patch promptly.

## Terminal & Auto-exec

- Treat commands as unsafe by default. Use Allow/Deny lists for auto-exec.
- Never auto-run destructive commands (e.g., git push --force, rm, chmod).
- Avoid `cd`; set explicit CWD in tool calls. Limit output to essentials.

## MCP & External Tools

- Enable only necessary MCP servers/tools. Review scopes and endpoints.
- Keep `~/.codeium/windsurf/mcp_config.json` free of secrets; reference env vars where needed.
- Rate-limit/timeout external calls; validate inputs to MCP tools.

## Error Messages

- Be specific enough for remediation, but do not leak secrets, file system layout, or stack traces in production.
- Map server errors to concise UI messages; include a “details” toggle for dev only.

## Project-Specific Anchors

- Absolute path enforcement for File APIs is mandatory; do not weaken.
- All backend routes under `server/**` must verify JWT before access.
- WS auth: call `GET /api/config` to derive WS URL if needed; connect with `?token=`.

## Incident Hygiene

- On suspected leak, rotate tokens/keys and invalidate sessions.
- Add a brief postmortem to `documentation/` with root cause and fix.
