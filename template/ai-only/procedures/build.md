# Build the next iteration of an approved spec

Build from the spec named in the request: `ai-only/<solution>/<item>.md`. If
none was named, list the specs under each project's `ai-only/` and ask.
`<projectRoot>` is the nearest folder above it that holds `Project_brief.md`.

## Read only these

- `ai-only/Project_digest.md`: the rules every build obeys.
- `ai-only/<solution>/_solution.md`: repo, layout, commands and security rules.
  If it is missing, translate `<solution>/application-spec.json` first.
- The item's spec, and its human brief's front matter (`status`, `deliverable`,
  `depends-on` / `dependsOn`).
- `ai-only/Code_map.md`, if it exists: the first sentence of each row.

## Stop before planning if

- `node tools/spec-lint.mjs --ready <spec>` fails. Name the open `UNKNOWN`s; a
  person answers them.
- A brief it depends on is not `status: built`. Say which to build first.
- `node tools/brief-lint.mjs <projectRoot>` reports an error for this item's deliverable.
- The repo or local path in `_solution.md` is missing or not checked out.
- It needs new infrastructure or a pipeline. That is `/pipeline`, its own plan.

## 1. Plan, then wait

Open with the **approval card**: plain English, 10 lines or fewer, for a person:

```
Change:      <one sentence>
Deliverable: <name> — <what this adds to it>
Where:       <solution> in <repo / local path>
Reuses:      <code-map rows, or "nothing found">
Rules hit:   <security or house rules this touches, or "none">
New deps:    <packages to add, or "none">
Debt:        <what will be left undone, or "none expected">
Unknowns:    0
```

Below it, the plan for the AI: one line per action and check in the spec, and
how each is done. **Wait for approval before touching code.**

**First build in a solution with no code yet:** the plan is the scaffold alone,
from `_solution.md`'s `layout`, `test` and `cmd` lines. Use pinned versions;
anything unpinned gets the latest stable, and its version goes in the report.

## 2. Build

- Use the model and effort the spec's `model` line names.
- Make the smallest change that meets the spec. Existing code is production,
  even if it looks wrong.
- Obey every `rule` in `_solution.md` and the digest. Breaking one means not done.
- Never write a secret value into code, config or logs. Use setting names.
- If the testing floor or `test` line calls for TDD: write a failing test, make it
  pass, then tidy.
- Stuck? Stop and record it as debt. Don't loop.

## 3. Report

Run the `cmd: test` and `cmd: build` commands. Append to the spec:

```
## Round <n>
### What I did
### What I could not do  (and what you would need to tell me)
### Debt I left behind
```

Include the command results, each check and the test that proves it, and an
estimate of the tokens the round used. Update `ai-only/Code_map.md` (create it
from `ai-only/3-code-map.template.md`): one row per method you created or
changed, describing it now. Run `node tools/code-map-lint.mjs` and fix what it
reports. On the first successful build, set the brief's `status: built`.

## 4. Stop at the end of a deliverable

If this was the last item naming its deliverable, stop. Say what the deliverable
now does end to end, and wait. Don't start the next one.
