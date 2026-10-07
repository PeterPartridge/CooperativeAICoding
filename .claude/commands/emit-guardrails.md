---
description: Write the project's guardrails out in other agents' native formats — AGENTS.md, CLAUDE.md, Kiro steering, Cursor rules — from the same spec, so one brief binds every agent.
argument-hint: [targets, comma-separated: agents|claude|kiro|cursor|copilot — default "agents"] [project root, optional]
---

Follow **`ai-only/procedures/emit-guardrails.md`** exactly, for: $ARGUMENTS

Resolve it under the project root you are working in — in this repository that is
`template/ai-only/procedures/emit-guardrails.md`. The procedure is the instruction; this
file only passes the arguments to it, so that an agent which is not Claude Code
follows the same text rather than a copy that has drifted.
