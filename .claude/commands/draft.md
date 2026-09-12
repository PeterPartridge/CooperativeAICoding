---
description: Fill in a project brief from an existing codebase — drafted answers with their sources, and at most five multiple-choice questions at the end.
argument-hint: [project root, optional — a folder whose root will hold Project_brief.md] · or "item <path to an item brief>"
---

Draft a brief from the code that is already here: $ARGUMENTS

Run the `draft-brief` skill.

- **No argument** → draft the **Project Brief** for this repository, into
  `Project_brief.md` at the root of the folder I am in (or the project root, if
  one already exists above it).
- **A folder** → draft that project's `Project_brief.md`.
- **`item <path>`** → draft that one page / endpoint / model brief instead.

Hold to these, they are the point of the skill and not negotiable:

1. **Read for intent before mechanism** — README and docs, tests, recent commit
   messages, the public surface, manifests; the implementation last.
2. **Mark every answer** with `> drafted · confident|guessed|could not tell ·
   from <files>`, and **leave "could not tell" answers empty**. Never write a
   plausible sentence to avoid an empty field.
3. **Never draft the deliverables**, or who the users are where nothing says so,
   or anything about cost, models or effort. Those are decisions, not facts
   about the code.
4. **At most five questions at the end**, ranked by what blocks the most work,
   **multiple choice wherever the code offers real candidates** — two to four
   options drawn from what you actually found, plus "something else". Ask them
   in conversation too, so I can answer by letter.
5. Save with `status: drafted`, and **never overwrite a brief that is `filled`
   or `approved`** — stop and tell me instead.

Then tell me: how many answers are confident, how many guessed, how many you
could not tell — and the questions.

`/translate` will refuse this brief until I have been through it and set
`status: filled`. That is deliberate: your answers are a proposal until I accept
them.
