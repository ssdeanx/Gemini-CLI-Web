# Migrating `server/routes/mcp.js` from Claude CLI to Gemini CLI (Config-Backed)

This guide describes how to migrate MCP management endpoints in `server/routes/mcp.js` to work with Gemini CLI using settings-based configuration, without editing any Gemini docs. No `.js/.jsx` edits are performed by this guide; it specifies the exact steps and contracts to implement.

- __Authoritative Sources in Repo__
  - `documentation/Gemini/configuration.md`: `mcpServers`, `allowMCPServers`, `excludeMCPServers`, transports, timeouts.
  - `documentation/Gemini/tools-api.md`: MCP discovery, prefixed tool names (`serverAlias__actualToolName`).
  - `documentation/Gemini/commands.md`: CLI usage (`/mcp`, `/tools`, descriptions/schemas).

---

## 1) Target Behavior (What changes)

- Replace all `spawn('claude', ...)` calls with read/write operations to the single canonical Gemini CLI settings.json.
- Endpoints become config managers for `mcpServers` instead of shelling out to any CLI.
- Gemini CLI will auto-discover MCP tools from the updated config; verification is via CLI (`/mcp`, `/tools`).

---

## 2) Settings Location (Canonical)

- `~/.gemini/settings.json`
- Create the directory/file if missing. Use 0600 perms for the file.

Helper (conceptual):

- `resolveSettingsPath()` → returns `~/.gemini/settings.json`
- `readSettings(file)` → JSON or `{}` if missing
- `writeSettings(file, data)` → atomic write (tmp + rename)

---

## 3) Endpoint Mapping (Keep current routes; change implementation)

- __POST `/api/mcp/cli/list`__
  - Input: none
  - Action: read settings; ensure `settings.mcpServers = settings.mcpServers || {}`
  - Output: `{ success: true, servers: [ { name, transport } ] }` where items come from `Object.entries(mcpServers)`

- __POST `/api/mcp/cli/add`__
  - Input: `{ name, type, command?, args?, cwd?, env?, url?, headers?, timeout?, includeTools?, excludeTools? }`
  - Validate (see Section 4); normalize to schema per `configuration.md`:
    - stdio → `{ transport:'stdio', command, args?, cwd?, env?, timeout?, includeTools?, excludeTools? }`
    - http/sse → `{ transport:'http'|'sse', url, headers?, timeout?, includeTools?, excludeTools? }`
  - Upsert: `settings.mcpServers[name] = normalizedCfg`
  - Write settings
  - Output: `{ success: true, server: { name } }`

- __DELETE `/api/mcp/cli/remove/:name`__
  - Input: none
  - Action: delete `settings.mcpServers[name]` if present; write settings
  - Output: `{ success: true }` (404 if missing is acceptable alternative)

- __GET `/api/mcp/cli/get/:name`__
  - Input: none
  - Output: `{ server: settings.mcpServers[name] }` or `404`

---

## Frontend Compatibility (UI contracts)

- __Scope handling__
  - Server MUST accept but ignore any `scope` query/body parameter. Always operate on `~/.gemini/settings.json`.

- __Response shapes required by UI__
  - POST `/api/mcp/cli/list` → `{ success: true, servers: [ { name, transport } ] }`
  - POST `/api/mcp/cli/add` → `{ success: true, server: { name } }` on success; non-OK returns `{ error: string }`
  - DELETE `/api/mcp/cli/remove/:name` → `{ success: true }` (or 404 with `{ error: string }`)
  - GET `/api/mcp/cli/get/:name` → `{ success: true, server }` or 404 with `{ error: string }`

- __Compatibility endpoints kept for ToolsSettings.jsx__
  - POST `/api/mcp/servers/:name/test` → `{ testResult }`
  - POST `/api/mcp/servers/:name/tools` → `{ toolsResult }`
  - POST `/api/mcp/servers/test` → `{ testResult }`
  - Note: Methods may be POST to match current UI; ignore any `scope` parameter.

---

## 4) Validation & Security (Aligns with `configuration.md` and Windsurf rules)

- __name__: `/^[a-zA-Z0-9._-]{1,64}$/`
- __type/transport__: `stdio | http | sse`
- __url__: require `https://` unless `NODE_ENV==='development'` (allow `http://` only then)
- __headers/env__: `Record<string,string>`; redact values in logs; block sensitive keys like `Set-Cookie`
- __timeout__: number > 0; cap e.g. `<= 30000`
- __includeTools/excludeTools__: arrays of strings; no overlaps
- Reject unknown top-level fields
- Log structure: `{ event, route, status, ms }` (no secrets)
- Rate limit: e.g., `10/min/user` (implement in middleware if available)

---

## 5) Config Shapes (from `documentation/Gemini/configuration.md`)

- __STDIO__

```json
{
  "transport": "stdio",
  "command": "python3",
  "args": ["mcp_server.py", "--port", "8080"],
  "cwd": "./mcp_tools/python",
  "env": { "PYTHONUNBUFFERED": "1" },
  "timeout": 10000,
  "includeTools": ["grep"],
  "excludeTools": []
}
```

- __HTTP__

```json
{
  "transport": "http",
  "url": "https://mcp.example.com",
  "headers": { "Authorization": "Bearer ${MCP_TOKEN}" },
  "timeout": 10000,
  "includeTools": [],
  "excludeTools": []
}
```

- __SSE__

```json
{
  "transport": "sse",
  "url": "https://stream.mcp.example.com/sse",
  "headers": { "Authorization": "Bearer ${MCP_TOKEN}" },
  "timeout": 10000
}
```

---

## 6) Migration Steps (No code edits performed by this document)

1) __Disable Claude CLI calls__ conceptually by routing to config management:
   - Replace spawn logic with read/modify/write of `~/.gemini/settings.json`.
2) __Implement validation__ per Section 4; redact logs.
3) __Write settings__ atomically; ensure directories exist.
4) __Keep response shapes__ compatible with current UI expectations.

---

## 7) Verification (Using Gemini CLI; no code changes here)

- In a Gemini CLI session:
  - `/mcp` → confirm servers list shows your newly added alias
  - `/tools` → confirm tools prefixed as `alias__toolName`
  - Ask the model to use `alias__toolName` with needed params to verify flow
- If discovery is missing:
  - Confirm you edited `~/.gemini/settings.json`
  - Validate config shape against `configuration.md`
  - Check server reachability (for http/sse) and logs (without secrets)

---

## 8) Rollback Plan

- Revert settings changes by removing the server blocks from the relevant `settings.json`.
- If necessary, restore the previous `mcp.js` behavior by re-enabling the CLAUDE-CLI spawn logic (not recommended).

---

## 9) Operational Notes

- Prefer `https://` for remote transports; use env vars for tokens; never log secrets.
- Use include/exclude tool lists to control exposure.
- Keep file paths absolute if later introducing file arguments.

---

## 10) Quick Reference

- __Settings__: `~/.gemini/settings.json`
- __Discovery__: `documentation/Gemini/tools-api.md`
- __CLI checks__: `documentation/Gemini/commands.md`

This guide is designed to be implemented by a developer without changing `.js/.jsx` here. It aligns strictly with your `documentation/Gemini/*` definitions.
