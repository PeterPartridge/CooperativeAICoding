---
name: translate-brief
description: Translate a filled-in CooperativeAICoding brief (Markdown Project_brief.md or page brief, or a JSON endpoint/database-model/solution-spec form) into a structured AI System Spec, a reusable Project Digest, and a Skills List, then save it in the project root's AI workspace (ai-only/) mirroring the human folder layout. Use whenever the user hands over or points at a filled-in CooperativeAICoding form and wants it turned into instructions an AI can build from.
---

Read **`ai-only/procedures/translate.md`** under the project root you are working in,
and follow it exactly. In this repository the canonical copy is
`template/ai-only/procedures/translate.md`; a project created with
`npx github:PeterPartridge/CooperativeAICoding init` has it at
`ai-only/procedures/translate.md`.

**The procedure is the instruction, and it lives there rather than here** so that
an agent which is not Claude Code reads the same text from `AGENTS.md` instead of
a copy that has drifted. Do not add behaviour to this file: a rule that exists in
`.claude/` and nowhere else is a rule only one model follows.
