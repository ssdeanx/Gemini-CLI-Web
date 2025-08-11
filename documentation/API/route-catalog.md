# Gemini-CLI-Web Route Catalog (HTTP + WS)

All protected routes require Authorization: `Bearer <token>`. File APIs require absolute paths.

## Auth
- GET /api/auth/status → { authenticated: boolean }
- POST /api/auth/login { username, password } → { token }
- POST /api/auth/register { username, password } → { success }
- GET /api/auth/user → { id, username, created_at, last_login }
- POST /api/auth/logout → { success }

## Config
- GET /api/config → { serverPort, wsUrl }

## Projects
- GET /api/projects → [ { name, displayName, sessions, sessionMeta? } ]
- PUT /api/projects/:projectName/rename { displayName } → { success: true }
- DELETE /api/projects/:projectName → { success: true }
- POST /api/projects/create { path } → { success: true, project }

## Sessions
- GET /api/projects/:projectName/sessions?limit&offset → { sessions: [ { id, title, created_at, updated_at } ], total }
- GET /api/projects/:projectName/sessions/:sessionId/messages → { messages: [...] }
- DELETE /api/projects/:projectName/sessions/:sessionId → { success: true }

## Files
- GET /api/projects/:projectName/files → directory tree JSON
- GET /api/projects/:projectName/file?filePath=/abs/path → { content, path }
- PUT /api/projects/:projectName/file { filePath, content } → { success: true, path, message }
- GET /api/projects/:projectName/files/content?path=/abs/path → binary stream (images, etc.)

## Git (/api/git/*)
- GET /status?project= → { branch, modified[], added[], deleted[], untracked[] } | { error, details }
- GET /branches?project= → { branches[] }
- GET /remote-status?project= → { hasRemote, branch, remoteBranch?, remoteName?, ahead, behind, isUpToDate } | { message }
- POST /checkout { project, branch } → { success, output }
- POST /create-branch { project, branch } → { success, output }
- POST /fetch { project } → { success, output, remoteName }
- POST /pull { project } → { success, output, remoteName, remoteBranch } | { error, details }
- POST /push { project } → { success, output, remoteName, remoteBranch } | { error, details }
- POST /discard { project, file } → { success, message }
- GET /diff?project=&file= → { diff } | { error }
- GET /commits?project=&limit= → { commits: [ { hash, author, email, date, message, stats? } ] }
- GET /commit-diff?project=&commit= → { diff } | { error }
- POST /generate-commit-message { project, files[] } → { message }
- POST /commit { project, message, files[] } → { success, output }

## MCP (/api/mcp/*)
- POST /cli/list → { servers: [...] }
- GET /servers?scope=user|system → { servers: [...] }
- POST /cli/add { ... } → { success, server }
- DELETE /cli/remove/:serverId → { success }
- GET /servers/:serverId/test?scope= → { ok, details? }
- POST /servers/test { ... } → { ok, details? }
- GET /servers/:serverId/tools?scope= → { tools: [...] }

## WebSocket
- Path: /ws?token=BearerJWT
- Messages: { type: 'projects_updated', projects, timestamp, changeType, changedFile }
