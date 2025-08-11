-# Code Smells and Refactoring

description: Detect code smells using linters + heuristics, prioritize, and apply minimal refactors (web-informed)

1. Establish baseline
// turbo
1. Run: npm run lint --silent || true
// turbo
1. Run: npm run build --silent || true
   - Capture errors/warnings; group by file and rule.

1. Web research references (for rationale & fixes)
   - ESLint rules catalog (problematic patterns, suggested fixes)
   - Refactoring.Guru code smells taxonomy (Bloaters, Couplers, Dispensables, etc.)
   - Save 3–5 authoritative URLs per dominant smell.

1. Heuristic smells scan (beyond ESLint)
// turbo
1. Run: rg -n "TODO|FIXME|HACK|XXX" -S || true
// turbo
1. Run: rg -n "console\.log\(|debugger;" -S src server || true
// turbo
1. Run: rg -n "function .*\(|=>" --max-columns=120 src server || true
   - Flag: overly long files/functions, nested conditionals, duplicated logic, complex regexes, wide modules.

1. Prioritize
   - Rank by: safety (low risk first), frequency of use, impact on readability and defects.
   - Identify 3–5 quick wins and 1–2 deeper refactors with rollback plan.

1. Apply minimal refactors
   - Extract function/module, rename for clarity, reduce parameters, remove dead code.
   - Keep patches small with 3 lines of context; run tests/build after each change.
// turbo
1. Run: npm test --silent || true

1. Document & prevent regressions
   - Add/adjust ESLint/Prettier rules to enforce improvements.
   - Record before/after snippets and rationale in PR description.

## References (examples)
 
- ESLint Rules: <https://eslint.org/docs/latest/rules/>
- Refactoring Code Smells: <https://refactoring.guru/refactoring/smells>
