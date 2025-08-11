# MCP + Gemini CLI Integration Rules

These rules govern MCP endpoints and CLI subprocess usage in this repo. They do not modify any Gemini documentation files.

- __Scope__
  - Applies to `server/routes/mcp.js` and any MCP-related UI flows.
  - Do NOT edit `documentation/Gemini/**` when changing MCP behavior.

- __Auth & Security__
  - Require `Authorization: Bearer <token>` on all MCP HTTP routes; validate on server.
  - Never log tokens, cookies, headers, or env values. Redact in all logs and errors.
  - Enforce absolute paths if any file args are ever introduced (no `..` traversal).

- __Execution Safeguards__
  - Subprocess limits: max runtime 10s; cap stdout/stderr capture at ~64KB; kill on overrun.
  - Rate-limit endpoints (e.g., 10/min per user/IP). Deny bursts with 429.
  - Map nonzero exit codes to concise 4xx/5xx without leaking sensitive details.

- __Input Validation__
  - Schema-first validation; reject unknown fields.
  - `name`: `/^[a-zA-Z0-9._-]{1,64}$/`.
  - `type`: one of `stdio | http | sse`.
  - `headers`: string→string allowlist; redact values in logs; block `Set-Cookie` and similar.
  - `env`: string→string allowlist; block risky keys; never log values.
  - `url`: prefer `https://`; allow `http://` only in dev; validate host/port if necessary.

- __Transport Policy__
  - Prefer `stdio` or secure HTTP/SSE with explicit headers.
  - Do not auto-enable unknown transports; require explicit type selection.

- __Observability__
  - Structured logs: event, route, user id, status, elapsed ms, redaction applied.
  - Basic metrics: call count, success/error, timeout occurrences.

- __Error Handling__
  - Consistent JSON shape: `{ error, code?, details? }` where `details` is non-sensitive.
  - For CLI failures, include a short stderr summary only after redaction.

- __Docs Alignment__
  - Keep these rules under `documentation/Windsurf/`. Avoid editing `documentation/Gemini/**` when updating MCP logic.

- __Testing__
  - Add lightweight tests for list/add/get/remove covering: validation errors, redaction, timeouts, and rate limits.

- __Migration Guidance__
  - If migrating from another CLI to Gemini CLI commands:
    - Switch subprocess target and args behind a feature flag or config, not by editing Gemini docs.
    - Verify validation, timeouts, redaction, and rate limits remain enforced.
    - Update local route catalog if response shapes change.
