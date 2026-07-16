---
description: Scaffold a new solution item (page / endpoint / database-model) by copying the right blank form.
argument-hint: [type: page|endpoint|model] [solution folder] [item name] [project root, optional] — e.g. page CoperativeAI workspaceShell application
---

Create a new blank item form for me to fill in. Arguments: $ARGUMENTS
(order: type, solution folder, item name, optional project root — a folder whose
root contains `Project_brief.md`, e.g. `template/`, `application/`, `example/`).
If type/solution/name are missing, ask once. If the project root was not given
and more than one non-template project root exists, ask which one; default to
the only non-template project root otherwise.

Steps:
1. Map the type to its master form in `template/_forms/` (pages are Markdown;
   record-style forms are JSON):
   - `page` → `template/_forms/page.md`
   - `endpoint` → `template/_forms/endpoint.json`
   - `model` → `template/_forms/database-model.json`
2. Ensure the solution folder exists at `<projectRoot>/<solution>/`. If the folder is
   new, also remind me it needs a solution spec — copy
   `template/_forms/application-spec.json` into it and set `solutionType` to
   `website`, `api`, `database`, or `application` (CLI/TUI/desktop).
3. Copy the master form to `<projectRoot>/<solution>/<itemName>.<same extension>`
   **without filling it in** — it stays a blank form. A human answers in plain
   English: under the question headings in a Markdown form, or in the `answer`
   fields of a JSON form (and sets the name/status fields at the top).
4. Do NOT overwrite an existing file; if it exists, stop and tell me.
5. Tell me the path you created and that the next step is to fill it in, then run
   `/translate` on it.
