---
description: Competitive/adjacent research via web; synthesize an RFC with decisions and risks
---

1. Define scope & questions (features, UX, API, pricing/licensing, security, performance, ecosystem).

2. Use Web Search to find 5–10 authoritative sources per topic (official docs, changelogs, RFCs, benchmark posts, reputable blogs). Save URLs.

3. For top sources, read in full and extract:
   - Product/feature summary
   - Implementation details (APIs, protocols, schema)
   - Strengths/weaknesses; constraints
   - Migration/interop considerations

4. Build a brief comparison matrix:
   - Rows: Alternatives; Columns: Criteria (DevEx, Reliability, Cost, Security, Performance, Ecosystem)
   - Score 1–5 with one-sentence rationale each

5. Draft an RFC:
   - Context & Goals
   - Non-goals
   - Proposed Approach (design, data flow, API shapes)
   - Alternatives considered (with scores)
   - Risks & mitigations
   - Rollout plan & metrics

// turbo
6. Optional quick validations: run lints/build/tests to ensure current baseline is green.

7. Output: RFC markdown with links to sources; open follow-up issues/tasks if adopted.

