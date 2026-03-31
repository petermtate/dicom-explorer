---
name: review-pr-against-issue
description: Use when reviewing a change set against a Linear issue. Focus on correctness, regressions, missing tests, and whether the implementation actually matches the requested behavior.
---

# Review PR Against Issue

## Use this skill when
- Reviewing a PR or diff
- Comparing implementation to acceptance criteria
- Looking for regressions or hidden risks

## Review priorities
1. Does the change solve the issue?
2. Does it match acceptance criteria?
3. Is anything out of scope?
4. Are tests missing or weak?
5. Are there edge cases, regression risks, or deployment risks?
6. Are naming, structure, and patterns consistent with the repo?

## Process
1. Summarize the issue.
2. Summarize what the diff appears to do.
3. Compare diff to acceptance criteria.
4. Identify:
   - correctness risks
   - edge cases
   - missing validation
   - maintainability concerns
   - deployment/config concerns
5. Categorize findings as:
   - must fix
   - should fix
   - nice to have

## Output format
### Summary
...

### Matches issue
- ...

### Must fix
- ...

### Should fix
- ...

### Nice to have
- ...

### Missing tests or validation
- ...