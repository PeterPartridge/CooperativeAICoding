---
description: Create or update a solution's CI/CD pipeline and missing infrastructure from its spec — secrets are never written into code.
argument-hint: [solution folder, e.g. ClothingAPI]
---

Run the `create-pipeline` skill for the solution: $ARGUMENTS

If no solution was given, ask which one (or list the solution folders under
each project root — a folder whose root contains `Project_brief.md`, e.g.
`template/`, `application/`, `example/` — that have a spec with an
`infrastructure` block).

Follow the skill exactly: read the solution spec's `infrastructure` and `scaffold`
blocks and the Project Digest, plan the resources + pipeline stages + named
settings, and wait for my approval before creating anything. Never write a secret
value into code, config, or logs — reference secrets by name and tell me which
ones I need to create, and where.
