---
description: Translate a filled-in CooperativeAICoding brief into a structured spec, digest, and skills.
argument-hint: [path to the filled-in brief, e.g. application/Project_brief.md or application/CoperativeAI/workspaceShell.md]
---

Follow **`ai-only/procedures/translate.md`** exactly, for: $ARGUMENTS

Resolve it under the project root you are working in — in this repository that is
`template/ai-only/procedures/translate.md`. The procedure is the instruction; this
file only passes the arguments to it, so that an agent which is not Claude Code
follows the same text rather than a copy that has drifted.
