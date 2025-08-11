---
description: Stage → AI commit message → commit → push → PR open (safe, repeatable)
---

1. Ensure a clean working tree (or list changed files concisely).
// turbo
2. Run: git status -s

3. Stage intentional changes (by file or hunk as needed).
   - If not staged yet, propose a minimal staging set and ask for confirmation.

4. Generate an AI commit message from staged changes.
   - Provide `type(scope): summary` + bullet body of key changes.
   - Ask user to confirm or edit before committing.

5. Commit and push.
// turbo
6. Run: git commit -m "<final message>"
// turbo
7. Run: git push -u origin HEAD

8. Open a pull request with a clean title/description.
// turbo
9. Run: gh pr create --title "<title>" --body "<body>"

10. Output: PR URL and a brief reviewer checklist.