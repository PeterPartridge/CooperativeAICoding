---
description: Translate a filled-in CooperativeAICoding brief into a structured spec, digest, and skills.
argument-hint: [path to the filled-in brief, e.g. template/Project_brief.md or template/ClothingWebsite/userLogin.md]
---

Run the `translate-brief` skill on the brief at: $ARGUMENTS

If no path was given, ask which filled-in brief to translate (or list the
candidate files under `template/` that look filled in).

Follow the skill exactly:
- Project Brief → produce System Spec + Project Digest + Project Skills, save to `template/claude-only/Project_system.md`.
- Page/endpoint/database-model brief → read only the Project Digest from `template/claude-only/Project_system.md`, then produce the Page Spec + Page Skills + PLAN, and save to the mirrored path `template/claude-only/<solution>/<item>.md`.

Do not invent scope; gaps go under Open Questions. Show the result and wait for
my approval before any building.
