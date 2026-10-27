# Translate a brief into a spec

Turn a filled-in brief into the spec the AI builds from, in the format of
[`ai-only/2-ai-system.template.md`](../2-ai-system.template.md). Read that first.

## Stop if

- The brief is `status: drafted` — those are the AI's answers until a person sets
  `filled`. Say how many questions at its end are open and offer to go through them.
- The brief is `blank`, or every answer is empty.
- You cannot tell what kind of brief it is — ask once.

## Paths

`<projectRoot>` is the nearest folder above the brief that holds
`Project_brief.md`. Framework files come from the project: `_forms/` and
`ai-only/` (in this repository, `template/`).

## What to write

| The brief | Write | Read as well |
|---|---|---|
| `Project_brief.md` | `ai-only/Project_digest.md` and `ai-only/Project_system.md` | — |
| `<solution>/application-spec.json` | `ai-only/<solution>/_solution.md` | its named preset and security baseline — only those two entries, not the whole file: `node -e "const b=require('./_forms/boilerplates.json');console.log(JSON.stringify([b.boilerplates['<preset>'],b.securityBaselines['<baseline>']]))"` |
| `<solution>/<item>.md` or `.json` | `ai-only/<solution>/<item>.md` | `ai-only/Project_digest.md` only. If it does not exist, translate the Project Brief first. |

- **Digest:** only the rules every item obeys: platform, each solution's repo and
  local path, infra and environments, where secrets live (names, never values),
  house rules with their meanings, the testing floor, deliverables in order,
  security model, roles, model and effort tiers. A rule left out of the digest is
  a rule no build sees.
- **System:** everything else in the brief: users, look and feel, skills.
- **Solution:** the spec's answers, plus the named preset's layout, tests and
  commands and the baseline's rules, each citing `[preset:…]` or `[baseline:…]`.
  What the spec fills in itself overrides the preset. Its own security rules add
  to the baseline and never weaken it.
- **Item:** objective, model and effort, actions, information, data, access,
  checks, limits, and skills that the digest does not already cover.

## Rules

- **Translate answers only.** `>` lines and `question`/`guidance`/`example`
  fields are the form, not answers.
- **Every line cites its source.** If you cannot cite one, the line is invented.
  Leave it out.
- **Never guess.** Write `UNKNOWN: <question> [source]` instead. That includes a
  contradiction between two briefs: cite both.
- An item naming a deliverable the Project Brief does not list is an `UNKNOWN`.
  `node tools/brief-lint.mjs <projectRoot>` checks every item at once.
- Restate nothing that is not in the brief. Write no plan; `/build` plans.

## Then

1. Run `node tools/spec-lint.mjs <projectRoot>` and fix every error.
2. Show the person the open `UNKNOWN`s. They answer in the brief, then you
   re-translate, or they mark one `DEFERRED: … — owner: <name>`.
3. A long or surprising `skill` list means the brief is too big or was
   misread. Say so.
4. Re-translate whenever the brief changes. Keep everything from the first
   `## Round` heading on: those are the build reports.
