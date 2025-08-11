---
description: Benchmark frontend/backend, profile hot paths, and propose targeted optimizations (with web research)
---

# Benchmark and Profiling

1. Define targets & SLAs
   - Frontend: initial JS size, TTI, route code-split points, editor load.
   - Backend: API latency for auth, files read/save, git status; WS message frequency.

1. Web research best practices
   - Use Web Search for current guidance on: Vite code-splitting, React 18 performance, Lighthouse CI, Node perf (event loop/libuv, streams), WS tuning.
   - Capture authoritative URLs; extract stack-relevant tactics.

1. Frontend benchmarks
// turbo
1. Run: npx lighthouse `http://localhost:4009` --only-categories=performance --quiet --chrome-flags="--headless" || true
// turbo
1. Run: npx source-map-explorer 'dist/assets/*.js' || true
   - Identify heavy modules; propose lazy-loading (Monaco/CodeMirror), route-level splits.
   - Use React Profiler to find re-render hotspots; memoize and split components.

1. Backend benchmarks
// turbo
1. Run: npx autocannon -d 10 -c 20 `http://localhost:4008/api/auth/status` || true
// turbo
1. Run: npx autocannon -d 10 -c 10 `http://localhost:4008/api/projects/{name}/file?filePath={abs}` || true
   - Check p95/p99; look for blocking I/O; propose streaming/limits.
   - Optional: `node --prof` or Clinic.js (doctor/flame) for flamegraphs.

1. WebSocket checks
   - Measure reconnect/backoff timings and message throughput; coalesce bursts.

1. Synthesize & patch plan
   - Top 3 wins with minimal risk; provide code/config diffs.
   - Add budgets to README (bundle size/TTI targets) and notes in PR.
