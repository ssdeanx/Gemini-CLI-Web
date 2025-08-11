---
description: Ingest external docs via web, synthesize actionable guidance, and update specs/rules safely
---

1. Define the doc questions
   - What do we need to learn? (API changes, library usage, security notes, migration steps)
   - Capture keywords and version constraints.

2. Web discovery
   - Use Web Search to find official docs, changelogs, RFCs, and migration guides.
   - Save URLs; prefer versioned, text-heavy documentation.

3. Ingestion & extraction
   - Read top sources and extract:
     - Key concepts, APIs, params, examples
     - Breaking changes and migrations
     - Security and performance notes

4. Synthesis → local artifacts
   - Update `documentation/API/openapi.yaml` if API references change.
   - Add/edit rules in `.windsurf/rules/` relevant to security or workflows.
   - Add a summary to `documentation/` with links to sources and decisions.

5. Verification
// turbo
6. Run: npm run build --silent || true
// turbo
7. Run: npm test --silent || true
   - Validate examples against our stack; avoid introducing secrets.

6. Output
   - Concise summary (What changed? Why? How to adopt?) with links and TODOs.
