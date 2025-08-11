---
trigger: glob
globs: src/**/*.{js,jsx,ts,tsx}
---

# Frontend Rules (Glob)

- Activation: Glob
- Glob: src/**/*.{js,jsx,ts,tsx}
- Scope: React 18 + Vite + Tailwind + Editors
- Size budget: ≤ ~12k chars/file

Keep UI responsive, modular, and aligned with API contracts.

## Architecture

- Entry: [src/main.jsx](cci:7://file:///home/sam/Gemini-CLI/src/main.jsx:0:0-0:0) → [src/App.jsx](cci:7://file:///home/sam/Gemini-CLI/src/App.jsx:0:0-0:0). Centralize providers (Auth, WS).
- Separate view vs. data hooks. Keep side-effects in hooks, not render paths.
- Reuse UI primitives; avoid one-off styles when Tailwind utility can express them.

## Data & API

- Use [src/utils/api.js](cci:7://file:///home/sam/Gemini-CLI/src/utils/api.js:0:0-0:0) for HTTP; align shapes with [documentation/API/openapi.yaml](cci:7://file:///home/sam/Gemini-CLI/documentation/API/openapi.yaml:0:0-0:0).
- Handle auth errors (401/403) centrally; trigger re-login when needed.
- Prefer SWR-like patterns (cache, dedupe) for frequently-read endpoints.

## WebSocket

- Put WS logic in [src/utils/websocket.js](cci:7://file:///home/sam/Gemini-CLI/src/utils/websocket.js:0:0-0:0) (one place). Expose status + events.
- Token via `GET /api/config` then `/ws?token=...`. Reconnect with backoff.

## Performance

- Lazy-load heavy editors/panels (Monaco/CodeMirror). Code-split routes/panels.
- Avoid large synchronous renders; memoize expensive subtrees.
- Keep initial JS bundle reasonable; tree-shake and avoid large dependencies.

## UX & Accessibility

- Use semantic HTML; label inputs; announce async states where applicable.
- Show concise errors; avoid leaking server internals.
- Keyboard navigability for core flows (chat, files, git).

## Styling

- Tailwind preferred. Abstract repeated patterns into components or class utils.
- Keep dark/light compatibility in mind; avoid hard-coded colors outside theme.

## State

- Local component state for UI; context or lightweight store for cross-cutting state (auth/user, WS status).
- Avoid deep prop drilling; hoist or use context thoughtfully.

## Testing & Dev

- Minimal checks for critical user journeys (auth, file open/save, git status).
- In dev, show WS connection indicator unobtrusively.

## Project-Specific Anchors

- File APIs require absolute paths. Editors must handle large files gracefully.
- Image viewer uses `GET /api/projects/:projectName/files/content?path=abs`.
- Components mapping lives in the Component–API memory; keep it updated when refactoring.