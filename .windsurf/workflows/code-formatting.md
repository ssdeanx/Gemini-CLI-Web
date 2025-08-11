---
description: Format and lint changed files; apply safe autofixes and list remaining issues
---

1. Detect changed files.
// turbo
2. Run: git diff --name-only

3. For supported file types, run formatters/linters with autofix:
   - JS/TS: eslint --fix + prettier
   - Markdown: markdownlint (no destructive fixes)
// turbo
4. Run: npm run lint --silent || true
// turbo
5. Run: npm run format --silent || true

6. Summarize fixes applied and remaining warnings/errors with short pointers.

7. If issues remain, propose minimal code edits with exact patches (3 lines of context).