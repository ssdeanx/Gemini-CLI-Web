-# Developer Onboarding

description: Bring a new developer to first-PR success quickly with environment, knowledge, and safety rails (web-informed)

1. Environment setup
// turbo
1. Run: node -v && npm -v
// turbo
1. Run: npm i --silent
   - Verify `npm run dev` starts API (4008) and Vite (4009); confirm `/api/config` returns wsUrl.

1. Credentials & access
   - Provide non-production `.env` template (no secrets committed). Document required env vars in `README.md`.
   - Create test user and login flow; verify JWT-based auth.

1. Repo tour (guided reading)
   - Frontend: `src/main.jsx`, `src/App.jsx`, `src/utils/api.js`, `src/utils/websocket.js`.
   - Backend: `server/index.js`, `server/routes/*`.
   - Docs: `documentation/API/openapi.yaml`, `documentation/API/route-catalog.md`, `documentation/Windsurf/rules.md`.

1. First task (scoped & safe)
   - Choose a small issue (docs typo, UI copy, non-breaking bug). Pair with mentor workflow if needed.
// turbo
1. Run: git checkout -b feat/onboarding-first-pr
   - Implement, run lint/format/build/tests locally.
// turbo
1. Run: npm run lint --silent || true
// turbo
1. Run: npm run format --silent || true
// turbo
1. Run: npm run build --silent || true

1. PR etiquette
   - Generate AI commit message; review and edit.
// turbo
1. Run: git commit -m "feat(docs): fix typo in onboarding README"
// turbo
1. Run: git push -u origin HEAD
   - Open PR with clear title/description; link to issue.

1. Knowledge base seeding
   - Add personal notes/FAQs under `documentation/` (onboarding.md). Include common fixes and commands.

1. Safety checklist
   - Secrets not in VCS; JWTs not logged; file APIs require absolute paths; WS connects with `?token=`.

## References (examples)
 
- Node Best Practices: <https://github.com/goldbergyoni/nodebestpractices>
- Node Production Checklist: <https://www.freecodecamp.org/news/node-js-production-checklist/>
- Developer Onboarding Best Practices: <https://www.pluralsight.com/resources/blog/software-development/developer-onboarding-checklist-best-practices>
