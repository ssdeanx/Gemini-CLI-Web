---
description: Run basic security checks and summarize actionable findings
---

1. Dependency audit.
// turbo
2. Run: npm audit --audit-level=moderate || true

3. Lint for obvious insecure patterns (best-effort).
   - Look for hardcoded secrets, tokens in code or scripts.

4. Server checks:
   - Verify JWT required on protected routes.
   - Verify absolute path enforcement for file APIs.
   - Review error messages are non-sensitive and actionable.

5. Output:
   - Summary of findings grouped by severity (High/Med/Low).
   - Concrete remediation steps or links to advisories.