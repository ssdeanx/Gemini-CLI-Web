---
description: description: Address PR review comments one-by-one with safe automation
---

1. Fetch the PR context and comments.
// turbo
2. Run: gh pr checkout <id>
// turbo
3. Run: gh api --paginate repos/<owner>/<repo>/pulls/<id>/comments | jq '.[] | {user: .user.login, body, path, line, original_line, created_at, in_reply_to_id, pull_request_review_id, commit_id}'

4. For EACH comment, do sequentially:
   - Print: "(index). From <user> on <file>:<line(s)> — <body>"
   - Open the file and inspect the line range.
   - If unclear, ask for clarification rather than guessing.
   - If actionable, make the minimal change before moving on.

5. After all comments:
   - Summarize changes made.
   - List comments needing user attention (with reasons).