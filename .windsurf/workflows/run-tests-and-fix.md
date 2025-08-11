---
description: Run targeted tests, capture failures, propose minimal fixes
---

1. Install deps if needed.
// turbo
2. Run: npm i --silent

3. Run tests (fast path); capture failures succinctly.
// turbo
4. Run: npm test --silent || true

5. For each failure:
   - Show test name and short error.
   - Locate implicated file/line(s).
   - Propose a minimal fix patch with 3 lines of context.
   - Ask for approval before applying.

6. Re-run affected tests after fixes; report final status.