---
trigger: model_decision
description: WebSocket Realtime Rules: Keep realtime robust, authenticated, and aligned between server and client. - Glob: server/**, src/utils/websocket.js, src/**/useWebSocket*.{js,ts,jsx,tsx} - Scope: WS auth, resiliency, message schema alignment
---

# WebSocket Realtime Rules (Model Decision + Glob)

- Activation: Model Decision
- Glob: server/**, src/utils/websocket.js, src/**/useWebSocket*.{js,ts,jsx,tsx}
- Scope: WS auth, resiliency, message schema alignment
- Size budget: ≤ ~12k chars/file

Keep realtime robust, authenticated, and aligned between server and client.

## Auth & Connect

- Derive WS URL via `GET /api/config` then connect to `/ws?token=<JWT>`.
- Validate JWT server-side at handshake and on reconnect. Expired → prompt re-login.
- Never log full tokens; mask in errors/diagnostics.

## Reconnect & Backoff

- Implement jittered exponential backoff with max cap (e.g., base 500ms, factor 2, max 30s).
- Reset backoff on successful connect; pause when tab hidden if appropriate.
- Detect network offline/online; try immediate reconnect on `online`.

## Heartbeats & Liveness

- If server supports pings, respond/track latency; otherwise, client-side idle timeout + periodic keepalive message negotiated with server.
- Close and reconnect on prolonged silence or protocol errors.

## Message Schema

- Document events in [documentation/API/route-catalog.md](cci:7://file:///home/sam/Gemini-CLI/documentation/API/route-catalog.md:0:0-0:0) under “WebSocket”.
- Maintain a types module (TS) or JSDoc typedefs for event payloads.
- On server payload changes, update client parsing and docs in the same PR.

## Throttling & Dedup

- Coalesce rapid-fire identical updates (e.g., file tree refresh) with a short debounce.
- Use ids/timestamps to deduplicate late or out-of-order messages.

## Error Handling

- Map WS close codes to concise UI messages; avoid leaking server internals.
- Auto-retry on transient errors; hard-stop on auth/permission errors and guide user.

## Testing & Dev

- In dev, surface connection status (connected/reconnecting/error) unobtrusively.
- Add a minimal test or manual check to verify auth + one event end-to-end.

## Project-Specific Anchors

- Current event: `projects_updated` → `{ type, projects, timestamp, changeType, changedFile }`.
- Client hook: [src/utils/websocket.js](cci:7://file:///home/sam/Gemini-CLI/src/utils/websocket.js:0:0-0:0) (or equivalent). Keep token handling and reconnect logic centralized.