---
description: Translate a filled-in CooperativeAICoding brief into a structured spec, digest, and skills.
argument-hint: [path to the filled-in brief, e.g. application/Project_brief.md or application/CoperativeAI/workspaceShell.md]
---

Run the `translate-brief` skill on the brief at: $ARGUMENTS

If no path was given, ask which filled-in brief to translate (or list the
candidate briefs under any project root — a folder whose root contains
`Project_brief.md`, e.g. `template/`, `application/`, `example/` — Markdown or
JSON — whose `status` is `filled`, or that otherwise look filled in).

Derive `<projectRoot>` by walking up from the brief path to the nearest folder
containing `Project_brief.md` (per the skill's "Resolving paths" section).

Follow the skill exactly:
- Project Brief → produce System Spec + Project Digest + Project Skills, save to `<projectRoot>/claude-only/Project_system.md`.
- Page/endpoint/database-model brief → read only the Project Digest from `<projectRoot>/claude-only/Project_system.md`, then produce the Page Spec + Page Skills + PLAN, and save to the mirrored path `<projectRoot>/claude-only/<solution>/<item>.md`.

Do not invent scope; gaps go under Open Questions. Show the result and wait for
my approval before any building.
