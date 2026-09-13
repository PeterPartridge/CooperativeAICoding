---
description: Write the project's guardrails out in other agents' native formats — AGENTS.md, CLAUDE.md, Kiro steering, Cursor rules — from the same spec, so one brief binds every agent.
argument-hint: [targets, comma-separated: agents|claude|kiro|cursor|copilot — default "agents"] [project root, optional]
---

Emit the guardrails for: $ARGUMENTS

Run the `emit-guardrails` skill. Default target is `agents` (a root
`AGENTS.md`), because Kiro reads it and always includes it, and Cursor takes it
as a plain-markdown alternative to `.mdc` rules — so one file covers several
tools. Emit a native format when I ask for it by name, or when the project needs
file-scoped rules a single root file cannot express.

Hold to these:

1. **Generate from `<projectRoot>/claude-only/Project_system.md`** — the Project
   Digest is the compact form this needs. Never invent a rule that is not in the
   spec, and never drop a house rule's project-specific definition: the name
   alone is decoration.
2. **About a page.** These files load into every interaction. If a line does not
   change what an agent does, leave it out.
3. **Carry the working agreement**, including the part that matters most: when
   the agent cannot understand something it **stops and says so** instead of
   guessing.
4. **Header on every generated file**, saying it was generated and that the
   brief is what to edit. **Never overwrite a file that lacks that header** —
   stop, name it, and show me what you would have written.
5. **End with the round-record shape and the honest limits** — what did not
   travel: plan approval, cost, policy, the sandbox, the board.

Then list what you wrote, what each file covers, and anything you left alone.
