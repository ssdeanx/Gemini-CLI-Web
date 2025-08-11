# Semantic Code Search

---
description: Perform semantic code search across the repo, map symbols/usages, and build a focused reading plan (with web-informed practices)
---

1. Define search intent
   - What do we need? (function behavior, API usage, performance hotspot, bug origin)
   - List exact symbols/paths if known (e.g., `server/routes/git.js`, `src/utils/api.js`).

1. Build fast local index
// turbo
1. Run: rg -nI "TODO|FIXME" || true
// turbo
1. Run: rg -nI "(function|class)\s+[A-Za-z0-9_]+" --type-add 'jsx:*.{jsx,tsx}' || true
// turbo
1. Run: ctags -R --languages=JavaScript,TypeScript,JSON,Markdown --fields=+n --exclude=node_modules || true
   - Use tags to jump to definitions; combine with `rg` for callsites.

1. Semantic cross-refs (editor/LSP)
   - Use your editor's “Go to Definition/References” to collect call graphs.
   - For React, trace data flow: component → hook → `src/utils/api.js` → server route.

1. Web Search (best practices/tools)
   - Query: semantic code search, ripgrep/ctags/LSP usage, Sourcegraph patterns, LSIF.
   - Capture authoritative URLs; extract tactics (e.g., structural search, symbol filters).

1. Structured search plan
   - Primary: filename/path filters, symbol names, API paths (`/api/git/*`), error strings.
   - Secondary: heuristics (config names, env vars, feature flags).

1. Execute targeted searches
// turbo
1. Run: rg -n "GET \/api\/projects" server || true
// turbo
1. Run: rg -n "renameProject\(|deleteProject\(|deleteSession\(" src || true
// turbo
1. Run: rg -n "WebSocket|wsUrl|projects_updated" -S src server || true
   - Save matches; open full files; build a concise symbol → locations map.

1. Synthesize findings
   - Diagram quick flows (request → handler → storage/FS → response → UI consumer).
   - Note mismatches with OpenAPI or route-catalog for follow-up.

1. Output
   - A short “reading plan” with the top files/functions to inspect and why.
   - Links to web resources used for search tactics.
