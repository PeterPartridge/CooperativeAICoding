# Build the next iteration of an approved spec

Build from `ai-only/<solution>/<item>.md`; with none named, list them and ask. `<projectRoot>` is the nearest folder above it that holds `Project_brief.md`.

## Read only

- `ai-only/Project_digest.md`
- `ai-only/<solution>/_solution.md` (translate its `application-spec.json` first if missing)
- the item spec
- the first sentence of each row of `ai-only/Code_map.md`, if it exists

Never read `qa/`. QA's tests check this build from outside.

## Stop before planning if

- `node tools/spec-lint.mjs --ready <spec>` fails. Name the open unknowns.
- `node tools/brief-lint.mjs --ready <its brief>` fails. Name what's missing; never sign for anyone.
- `node tools/brief-lint.mjs --status <each depends-on brief>` shows one not `built`.
- `node tools/brief-lint.mjs <projectRoot>` reports this item's deliverable.
- The repo in `_solution.md` is missing or not checked out.
- It needs new infrastructure or a pipeline. That is `/pipeline`.

## 1. Plan, then wait

Open with the approval card: ten plain-English lines or fewer.

```
Change:      <one sentence>
Deliverable: <name> — <what this adds>
Where:       <solution, repo>
Reuses:      <code-map rows, or nothing>
Rules hit:   <rules touched, or none>
New deps:    <or none>
Debt:        <expected, or none>
Unknowns:    0
```

Under it, for the AI: one line per action and check in the spec, and how each
is done. **Wait for approval.**

No code in the solution yet? Plan only the scaffold, from `_solution.md`, with
pinned versions; record the exact version of anything unpinned.

## 2. Build

- Use the spec's `model` line. Make the smallest change that meets the spec.
- Existing code is production, even if it looks wrong.
- Every `rule` binds. Breaking one means the build is not done.
- Write no secret values; use setting names.
- If the floor or the `test` line asks for TDD: failing test, pass, tidy.
- If you are stuck, record debt and stop. Don't loop.

## 3. Report

Run `cmd: test` and `cmd: build`. Append to the spec:

```
## Round <n>
### What I did
### What I could not do  (and what you would need to tell me)
### Debt I left behind
```

Include the command results, each check with the test that proves it, and a
token estimate.

Then:
- **Code map:** add or fix one row in `ai-only/Code_map.md` per method you
  created or changed. Create the file from `ai-only/3-code-map.template.md` if it
  doesn't exist. Run `node tools/code-map-lint.mjs`.
- **First successful build:** set the brief's `status: built`.

## 4. Stop at a deliverable's end

If this was the last item naming its deliverable, say what it now does end to
end, and wait for QA to sign it off in `qa/signoff.md`.
