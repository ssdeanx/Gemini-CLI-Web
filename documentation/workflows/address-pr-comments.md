---
description: Address PR review comments one-by-one with safe automation
---

1. Fetch PR comments context.
// turbo
2. Run: gh pr checkout <id>
// turbo
3. Run: gh api --paginate repos/<owner>/<repo>/pulls/<id>/comments | jq '.[] | {user: .user.login, body, path, line, original_line, created_at, in_reply_to_id, pull_request_review_id, commit_id}'

4. For EACH comment, sequentially:
   - Print: "(index) From <user> on <file>:<line(s)> — <body>"
   - Inspect file/lines. If unclear, ask for clarification; otherwise apply minimal change.

5. Summarize: changes made; list comments needing user input.
