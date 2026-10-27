<!-- Hand-written for working on the framework itself. The framework has no
     Project brief of its own yet, so there is nothing to generate this from;
     when it has one, `/emit-guardrails` can replace this file. -->

# CooperativeAICoding — how work is done here

A framework that gives Product, Developers, QA and AI one shared way of
working: plain-English briefs, specs the AI translates rather than authors, a
plan a person approves before code is written, and debt the AI has to declare.
It is Markdown, JSON and prompts — there is no application in this repository.

The desktop app built with it, [Swarm](https://github.com/PeterPartridge/Swarm),
lives in its own repository with its own guardrails. Changes to the app happen
there, not here.

## Where things live

| Folder | What it is |
|---|---|
| `template/` | The blank copy `init` hands to a project: the brief, the forms in `_forms/`, and the procedures in `ai-only/procedures/` |
| `example/` | A worked Clothing project to read before writing your own |
| `.claude/` | The slash commands and skills — thin pointers to the procedures, never copies of them |
| `tools/` | The checks (every `*-lint.mjs`, run together by `check.mjs`) and their tests |
| `bin/` | The `coperativeai init` CLI that copies the template into a project |
| `site/` | The GitHub Pages site, built from `README.md`, `HOW-TO-USE.md` and `INSTALL.md` |

## House rules

- **A procedure exists once.** It lives in `template/ai-only/procedures/`, and
  every command or skill that runs it points there. `tools/commands.test.mjs`
  fails when a pointer starts carrying behaviour of its own.
- **A check must be able to fail.** Every check in `tools/` has tests for the
  faults it exists to catch. A check that passes while reading nothing is
  worse than no check.
- **DRY** — if something repeats three times, move it into one shared place.
- **Keep it simple** — enough to finish the job, and no more.
- **Anything a project receives is a promise.** A change to `template/` or
  `bin/` reaches every project that runs `init` afterwards, so it is reviewed
  as such.

## Testing

From the repository root, these must pass:

```bash
npm test          # the checks' own tests, and every command points at something real
npm run check     # npm test, then every check over this repository
```

If you touched `site/`, build it: `cd site && npm ci && node build.mjs`.

## The working agreement

- Build the **smallest thing** that answers the request. No unrequested extras.
- Treat existing content as **in use** — projects have copied it.
- **Never invent scope.** Anything not asked for is an open question, not a
  decision you get to make.
- **When you cannot understand something, stop and say so.** A guess that
  becomes a rule in the template is the failure this framework exists to
  prevent.
- A person reviews and approves a plan before files are changed.

## When you finish, write this down

Append to `ROUND-RECORD.md`, one heading each:

### What I did
### What I could not do  (and what you would need to tell me)
### Debt I left behind  (one paragraph each, so each can become its own work item)

Debt that is not written down is debt that gets paid by surprise.

## What this file cannot give you

These are the rules, not the machinery. Plan approval, model and effort per
work item, what a run cost and a bounded place for agents to run live in the
Swarm app and its commands. With any other agent you get the guardrails and
the procedures; enforcing the rest is on you.
