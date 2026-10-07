---
name: create-pipeline
description: Create or update a CooperativeAICoding solution's CI/CD pipeline and missing infrastructure, driven by the infrastructure and scaffold blocks in its solution spec. Use when the user asks to set up a pipeline, deployment, CI, or infrastructure for a solution. Never writes secret values into code or committed config — secrets are referenced by name from their stores.
---

Read **`ai-only/procedures/pipeline.md`** under the project root you are working in,
and follow it exactly. In this repository the canonical copy is
`template/ai-only/procedures/pipeline.md`; a project created with
`npx github:PeterPartridge/CooperativeAICoding init` has it at
`ai-only/procedures/pipeline.md`.

**The procedure is the instruction, and it lives there rather than here** so that
an agent which is not Claude Code reads the same text from `AGENTS.md` instead of
a copy that has drifted. Do not add behaviour to this file: a rule that exists in
`.claude/` and nowhere else is a rule only one model follows.
