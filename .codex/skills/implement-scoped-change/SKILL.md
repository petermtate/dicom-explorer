---
name: implement-scoped-change
description: Use when the plan is already clear and the goal is to implement a narrowly scoped change with minimal risk and solid validation.
---

# Implement Scoped Change

## Use this skill when
- A plan already exists
- The task is well-scoped
- The goal is execution, not discovery

## Rules
- Do not widen scope.
- Reuse project patterns first.
- Touch as few files as possible.
- Prefer small, reversible changes.
- Update tests with the behavior change.

## Process
1. Re-read the acceptance criteria.
2. Inspect only the most relevant files first.
3. Implement the smallest change that satisfies the issue.
4. Add or update tests.
5. Run relevant checks.
6. Summarize:
   - what changed
   - why
   - how it was validated
   - any follow-ups not included

## Final output format
### Completed
- ...

### Files changed
- ...

### Validation
- ...

### Follow-ups not included
- ...