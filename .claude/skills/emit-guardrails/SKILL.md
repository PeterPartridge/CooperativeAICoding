---
name: emit-guardrails
description: Write a project's guardrails out in the native format of whichever AI coding agents the team uses — AGENTS.md, CLAUDE.md, Kiro steering files, Cursor rules — generated from the project's own spec so one brief binds every agent. Use when a team wants the framework's rules to reach an agent other than Claude Code, or asks whether this works with their tool.
---

Read **`ai-only/procedures/emit-guardrails.md`** under the project root you are working in,
and follow it exactly. In this repository the canonical copy is
`template/ai-only/procedures/emit-guardrails.md`; a project created with
`npx github:PeterPartridge/CooperativeAICoding init` has it at
`ai-only/procedures/emit-guardrails.md`.

**The procedure is the instruction, and it lives there rather than here** so that
an agent which is not Claude Code reads the same text from `AGENTS.md` instead of
a copy that has drifted. Do not add behaviour to this file: a rule that exists in
`.claude/` and nowhere else is a rule only one model follows.
