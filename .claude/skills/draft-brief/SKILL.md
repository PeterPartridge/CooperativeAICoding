---
name: draft-brief
description: Fill in a CooperativeAICoding Project Brief (or an item brief) from an existing codebase — drafting every answer the code can actually evidence, marking each with where it came from and how sure it is, and ending with a short multiple-choice list of the few things the code cannot tell anybody. Use when someone points at an existing project and wants the framework started without facing a blank form.
---

Read **`ai-only/procedures/draft.md`** under the project root you are working in,
and follow it exactly. In this repository the canonical copy is
`template/ai-only/procedures/draft.md`; a project created with
`npx github:PeterPartridge/CooperativeAICoding init` has it at
`ai-only/procedures/draft.md`.

**The procedure is the instruction, and it lives there rather than here** so that
an agent which is not Claude Code reads the same text from `AGENTS.md` instead of
a copy that has drifted. Do not add behaviour to this file: a rule that exists in
`.claude/` and nowhere else is a rule only one model follows.
