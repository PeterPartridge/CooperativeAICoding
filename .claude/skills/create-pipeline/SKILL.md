---
name: create-pipeline
description: Create or update a CooperativeAICoding solution's CI/CD pipeline and missing infrastructure, driven by the infrastructure and scaffold blocks in its solution spec. Use when the user asks to set up a pipeline, deployment, CI, or infrastructure for a solution. Never writes secret values into code or committed config — secrets are referenced by name from their stores.
---

# Create a pipeline (and infra) for a solution

Turns a solution spec's `infrastructure` and `scaffold` blocks into a working
CI/CD pipeline plus any missing infrastructure-as-code — deliberately, as its own
approved plan, separate from feature building.

## Hard rules (do not break these)

- **No secrets in code — ever.** Never write a secret value into source, pipeline
  YAML, IaC, committed config, examples, documentation, or logs. Reference every
  setting **by name** from where the spec says it lives (GitHub/DevOps secrets,
  Azure Key Vault, the host's application settings). If a value must exist for the
  pipeline to work, tell the person exactly which named secret to create and where
  — do not ask them to paste it to you.
- **Infra is its own plan.** Never create or change infrastructure or pipelines as
  a side effect of building a page/endpoint/model. This skill is the deliberate path.
- **Do not invent resources.** Only what the spec's `infrastructure.resources`
  lists; only create entries marked `existsAlready: false`. Respect the project's
  `infrastructure-policy` from the brief — if it says a person provisions, produce
  the IaC/pipeline but list the provisioning step for a human. Gaps go under Open
  Questions, never guesses.
- **Deploy only where allowed.** The `environments` answer says which environments
  the AI may deploy to; the pipeline must not auto-deploy anywhere else.
- **Honor the solution's `security` block.** Resolve its baseline from
  `_forms/boilerplates.json` (securityBaselines) — infra and pipeline must satisfy
  the rules that touch them (HTTPS-only hosting, TLS-only database connections,
  locked-down CORS origins, and so on).
- Honor the Working Agreement: smallest change, existing config is production,
  log debt, a person approves before anything is created.

## Procedure

1. **Read the inputs.** Derive `<projectRoot>` = the nearest ancestor of the
   solution folder containing `Project_brief.md` (`template/`, `application/`,
   `example/` each qualify; ask once if ambiguous). The solution's spec
   (`<projectRoot>/<solution>/application-spec.json`):
   its `infrastructure` block (resources, provisioning, environments, settings,
   pipeline) and `scaffold` block (commands — resolve a named boilerplate from
   `template/_forms/boilerplates.json`, a framework asset that always lives at
   the repo's `template/`). Get the repo location from the Project
   Digest's Solutions & repos line (`<projectRoot>/claude-only/Project_system.md`).
2. **Plan** — and wait for approval. State:
   - Resources to create (`existsAlready: false`), with the provisioning tool the
     spec names, and which are left to a person.
   - Pipeline stages, built from the spec's `pipeline` answer and the scaffold
     `commands` (typical: PR → install, build, test; merge → deploy to the
     AI-allowed environment).
   - Every named setting each stage needs, and where its value lives. Flag any
     setting a person must create, by name.
3. **Execute** — only after approval, in the solution's own repo: IaC files (e.g.
   `infra/`), pipeline files (e.g. `.github/workflows/`), settings wired by
   reference only.
4. **Verify what can be verified locally** — run the scaffold `build`/`test`
   commands the pipeline will run; lint pipeline files if a linter is available.
   List plainly what can only be proven by the pipeline's first run.
5. **Report back & declare debt** — append to the solution spec what was created,
   the named secrets/settings a person still has to supply, and any technical debt.
   Add a row per resource to the solution's section of
   `<projectRoot>/claude-only/Code_map.md` notes if useful — but never row-by-row
   pipeline internals.
