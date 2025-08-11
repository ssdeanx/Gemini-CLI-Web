# Examples and Patterns from the Web

---
description: Discover high-quality examples and patterns via web search; adapt safely into the codebase
---

1. Define the example need
   - Component/UI pattern, API usage snippet, WS pattern, CLI integration, etc.
   - Specify constraints (stack: React 18 + Vite, Express, WS, Tailwind; license compatibility; security).

1. Web discovery (quality first)
   - Use Web Search to find official docs, reputable blogs, framework recipes, and GitHub repos with permissive licenses.
   - Prefer text-heavy sources with runnable snippets and versioned docs. Save 5–10 URLs.

1. Evaluate candidates
   - Check framework/library versions, license, security implications (tokens/PII).
   - Favor patterns that match our architecture (hooks, centralized API helpers, WS module).

1. Synthesize an adapted example
   - Convert snippets to our file layout (e.g., `src/utils/api.js`, `src/utils/websocket.js`).
   - Ensure absolute path enforcement and JWT auth in examples as relevant.
   - Add Type/JSDoc annotations to clarify inputs/outputs.

1. Verify & document
// turbo
1. Run: npm run build --silent || true
// turbo
1. Run: npm test --silent || true
   - Add comments with links to source articles (no sensitive data). Summarize rationale in PR.

1. Maintain a patterns log under `documentation/patterns/` with:
   - Problem, chosen pattern, trade-offs, source links, and local example file references.
