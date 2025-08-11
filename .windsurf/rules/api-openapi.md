---
trigger: model_decision
description: Treat the OpenAPI spec as source of truth and keep server, client, and docs aligned. Glob: documentation/API/**, server/**, src/utils/api.js - Scope: Schema-first REST; client/server sync
---

# API & OpenAPI Rules (Model Decision + Glob)

- Activation: Model Decision
- Glob: documentation/API/**, server/**, src/utils/api.js
- Scope: Schema-first REST; client/server sync
- Size budget: ≤ ~12k chars/file

Treat the OpenAPI spec as source of truth and keep server, client, and docs aligned.

## Schema-First Contract

- Update [documentation/API/openapi.yaml](cci:7://file:///home/sam/Gemini-CLI/documentation/API/openapi.yaml:0:0-0:0) for every API change (paths, params, bodies, responses, errors).
- Keep [documentation/API/route-catalog.md](cci:7://file:///home/sam/Gemini-CLI/documentation/API/route-catalog.md:0:0-0:0) in sync with concise examples.
- Reject unknown fields and validate types/bounds server-side.

## Implementation Rules (Server)

- Define/verify request/response shapes against the spec.
- Return structured errors consistently: `{ error, details? }`.
- Ensure all protected routes enforce `Authorization: Bearer <token>`.

## Client Rules (Frontend)

- Centralize fetches in [src/utils/api.js](cci:7://file:///home/sam/Gemini-CLI/src/utils/api.js:0:0-0:0); align request/response shapes with the spec.
- Surface actionable errors; avoid leaking internals to UI toasts.
- For binary endpoints (e.g., files content), use appropriate response types.

## Change Workflow

1) Edit [openapi.yaml](cci:7://file:///home/sam/Gemini-CLI/documentation/API/openapi.yaml:0:0-0:0) first.
2) Implement/adjust server handlers under `server/**`.
3) Update [src/utils/api.js](cci:7://file:///home/sam/Gemini-CLI/src/utils/api.js:0:0-0:0) and consuming components.
4) Refresh [route-catalog.md](cci:7://file:///home/sam/Gemini-CLI/documentation/API/route-catalog.md:0:0-0:0) with method, path, request/response, and notable errors.

## Verification

- In dev, perform lightweight fetch checks after changes (auth, happy-path, common errors).
- If drift is detected, update the spec immediately or revert the code.

## WebSocket Note

- Document WS payloads and events in [route-catalog.md](cci:7://file:///home/sam/Gemini-CLI/documentation/API/route-catalog.md:0:0-0:0) under “WebSocket”.
- Keep client parsing in sync when payloads change.

## Project-Specific Anchors

- Existing endpoints in [openapi.yaml](cci:7://file:///home/sam/Gemini-CLI/documentation/API/openapi.yaml:0:0-0:0) cover auth, projects, sessions, files, git, MCP.
- File API requires absolute paths; document and enforce consistently.