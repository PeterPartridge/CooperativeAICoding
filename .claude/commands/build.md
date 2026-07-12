---
description: Build the next iteration of an approved spec — smallest change first — then report back and log debt.
argument-hint: [path to an approved spec in template/claude-only/, e.g. template/claude-only/ClothingWebsite/userLogin.md]
---

Build from the approved spec at: $ARGUMENTS
If no path was given, ask which spec to build (or list specs under
`template/claude-only/`).

Honor the Working Agreement at all times:
- Make the **smallest change** that satisfies the spec / this iteration — no unrequested extras.
- Treat all existing code as **working in production**; do not break it. Assume it works even if it looks broken.
- Pick the **model & effort** the spec specifies for this item.
- If you cannot finish something, **stop and record it as technical debt** rather than retrying endlessly.
- **Never write a secret value into code, config, or logs** — reference settings by
  name from the solution spec's `infrastructure.settings` list.
- **Obey the solution spec's `security` block** — resolve its named baseline from
  `template/_forms/boilerplates.json` (securityBaselines) plus its extra rules, and
  treat each rule like a test: a build that breaks one is not done. Say in the plan
  if a change touches anything a rule covers.
- If the change needs **new infrastructure or pipeline work**, stop — that is its own
  approved plan via `/pipeline` (the `create-pipeline` skill), never a side effect
  of building this item.

Workflow:
0. **Scaffold (first build in a solution only)** — if the solution's repo has no
   code skeleton yet, plan that first, as its own smallest-change plan approved
   before any page or endpoint is built. The shape comes from the `scaffold` block
   of the solution's spec (`template/<solution>/<Type>-spec.json`): resolve a named
   `boilerplate` from `template/_forms/boilerplates.json`, then apply any scaffold
   fields the spec fills in itself as overrides. Use the versions the boilerplate
   pins; anything unpinned gets the latest stable release, with the exact version
   recorded in the report-back. Use its `commands` to verify the skeleton builds
   and its tests run before calling scaffolding done. If the spec has no scaffold
   block and no boilerplate fits, stop and ask.
1. **Plan** — restate a one-paragraph summary plus bullet-point changes (one per use case).
   Look up the solution's repo and local path in the Project Digest's **Solutions &
   repos** line (`template/claude-only/Project_system.md`) — that is where the code
   gets built, which may be a different repository from this one; name it in the
   plan, and stop and ask if the location is missing or not checked out. Read the
   solution's spec (`template/<solution>/<Type>-spec.json`) in full — its
   conventions, auth, standard responses, security, scaffold, and mustNotDo all
   bind this build, not just the blocks named elsewhere. Check the item's
   dependencies (`depends-on` in a Markdown brief, `dependsOn.entries` in a JSON
   one): every listed brief must be `status: built` — if any isn't, stop and say
   which to build first. Check `template/claude-only/Code_map.md` (if it exists):
   reuse an existing method
   wherever one already does the job — say so in the plan — instead of writing a
   new one. Wait for my approval before editing code.
2. **Execute** — only after I approve.
3. **Report back** — run the solution's `test` (and `build`) commands from its
   scaffold block and include the results; then append to the spec what you did,
   how each use case was implemented, and the test scenarios you created. Then
   update `template/claude-only/Code_map.md`
   (create it from `template/claude-only/3-code-map.template.md` if it doesn't exist):
   one row per method you created or changed — the method, its file, one line on what
   it does, and which other files/methods it uses. Fix any rows your changes made stale.
   On the item's first successful build, set its human brief's `status` to `built`.
4. **Declare debt** — list any technical debt created or anything you could not implement, and (if useful) score how token-intensive each change was.
