---
name: debug-vercel-preview
description: Use when a Vercel preview, build, or runtime behavior is failing or differs from local behavior. Focus on platform-specific causes first.
---

# Debug Vercel Preview

## Use this skill when
- Vercel build fails
- Preview deploy works differently than local
- Runtime, routing, env, cache, middleware, or framework issues appear in preview

## Investigation order
1. Build logs
2. Runtime selection and framework behavior
3. Environment variables and secrets
4. Route handlers, middleware, rewrites, redirects
5. Server/client boundaries
6. Cache, ISR, PPR, or data fetching behavior
7. Project settings likely required outside the codebase

## Rules
- Treat Vercel output as primary evidence.
- Do not assume local success means deploy success.
- Separate code fixes from project-settings fixes.

## Output format
### Failure summary
...

### Most likely cause
...

### Evidence
- ...

### Suggested fix
1. ...
2. ...

### Validation after fix
- ...
