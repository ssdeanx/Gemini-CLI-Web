---
description: Build, deploy, and verify the app safely
---

1. Build the project; show summary only.
// turbo
2. Run: npm run build --silent

3. Smoke-check build artifacts (dist/ presence, key files).

4. If using app deploys (Windsurf beta), prepare deploy metadata and trigger via Cascade tool (Netlify-like).
   - Confirm target subdomain/project; redact any secrets.

5. Post-deploy:
   - Output deploy URL.
   - Run a quick health check (GET /) and note status.
   - List next steps (cache busting, env checks).