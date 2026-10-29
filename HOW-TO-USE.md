# How to Use CooperativeAICoding

A practical, start-to-finish guide. The idea: **you** describe what you want in
plain English; **the AI** translates that into structured specs and builds from
them — making the smallest change each time, and writing down anything it can't do.

For the framework's reasoning, see the [main README](README.md). For the folder
layout, see [`template/README.md`](template/README.md). This file is just *how to run it*.

Nothing here needs the desktop app, or any download: the framework is this
repository's `template/` folder plus Claude Code, on any operating system. If
you do want the app — or you build on Linux — that is [`INSTALL.md`](INSTALL.md).

**Not using Claude Code?** Run `coperativeai init --agents cursor` (or `codex`,
`gemini`, `copilot`, `opencode`, `kiro`, several at once) and the same commands
arrive in that agent's own format. The steps below read the same there. Any
other agent can follow a procedure if you point it at the file, e.g. "follow
`ai-only/procedures/build.md` for this spec". `/emit-guardrails` writes the
project's rules into the file your agent reads, such as `AGENTS.md`.

---

## The loop in one picture

```
Fill a form                 →   Translate to a spec   →   Review & approve   →   Build   →   Iterate
   (you, in your project)       (/translate)              (you)                 (/build)    (add a change round)
```

A **project** is any folder whose root holds a `Project_brief.md` — `template/`
is the blank starting copy and `example/` is a worked project. Every command resolves paths from that project
root; the blank forms and boilerplates come from the project's `_forms/` (in this
repository, `template/_forms/`).

Forms come in two shapes, matched to their content. Prose briefs (the project
brief and page briefs) are **Markdown**: write your plain-English answer under
each question heading — lines starting with `>` are guidance, everything else is
yours. Record-style forms (endpoints, database models, solution specs) are
**JSON**: fill in the `answer` fields and entry lists. Everything the AI
generates lands in your project's `ai-only/` folder, the AI's workspace,
mirroring your folders.

---

## First-time setup (once per project)

0. **Put the framework in the project.**

   ```bash
   npm install -g coperativeai   # once per machine
   coperativeai init
   ```

   It writes `Project_brief.md`, `_forms/`, `ai-only/`, the `.claude/`
   commands and `tools/` into the folder you run it in, and writes over nothing.
   Skip this inside the framework's own repository, where `template/` already is
   the blank copy. Later, `coperativeai update` brings in framework fixes. It
   replaces only files nobody changed, and keeps your edits and answers.

1. **Fill in the project brief.** Copy [`template/Project_brief.md`](template/Project_brief.md)
   into your project folder (or fill it in place for a template-based project)
   and answer each question in plain English under its heading (the `>` lines are
   guidance and examples). Set `status: filled` at the top when you're done. This
   is the whole-project "why," the tech direction, the house rules, security, and
   your model/effort tiers — plus **where each solution's code lives** (repo and
   local path), so the AI can build across multiple repositories.

2. **Translate it.** Run:

   ```
   /translate example/Project_brief.md
   ```

   Claude writes `ai-only/Project_digest.md` (the few rules every build obeys)
   and `ai-only/Project_system.md` (the rest: users, look and feel, skills), e.g.
   `example/ai-only/`. Every line names the answer it came from, and
   `node tools/spec-lint.mjs` checks that, so you don't have to read it all.

3. **Answer the `UNKNOWN`s.** Those lines are what Claude could not tell from
   your brief. It doesn't guess. Answer them in the brief and re-run
   `/translate`, or mark one `DEFERRED: … — owner: <name>`. If the skills list
   looks surprisingly long, the project may be too big: split it.

---

## Adding an item (a page, an endpoint, or a model)

Each solution (website, API, database) is a folder; each **item** is a file
inside it. *Item* is the umbrella word for the three kinds: a **page** (one
screen, panel, or command group), an **endpoint** (one API resource), or a
**model** (one table). **A backend-only project has no pages** — it is
endpoints and models, and every step below is identical for them.

1. **Scaffold the form.** For example, a login page in the `ClothingWebsite` solution:

   ```
   /new-item page ClothingWebsite userLogin
   ```

   This copies the right blank form to `<projectRoot>/ClothingWebsite/userLogin.md`
   (pages are Markdown; endpoints and models are JSON, e.g.
   `<projectRoot>/ClothingAPI/Login.json`). Add the project root as a fourth
   argument if you have more than one project (e.g.
   `/new-item page ClothingWebsite checkout example`). A brand-new solution folder also needs its
   spec — a copy of `application-spec.json` with `solutionType` set to `website`,
   `api`, or `database`; the command reminds you. Run `/translate` on that spec
   too: it writes `ai-only/<solution>/_solution.md`, the solution's rules and
   commands with its preset copied in.

2. **Product plans it, and signs.** Product answers Parts 1–2: why it exists,
   what it does for customers and the business, what people do on it, and who may
   use it. They can plan it with Claude:

   ```
   /product a customer can see where their order is
   ```

   Claude asks a few multiple-choice questions and drafts Product's words, marked
   as drafted. Product fixes it, sets `status: filled`, and signs
   `product-signoff: Sam 2026-10-30 round 1`. **That is sign-off 1.**

3. **Developers and Product agree how, and sign.** Developers answer Part 3:
   - How can we do this?
   - Is there a better way?
   - What happens with errors, and with other scenarios?
   - What technical challenges are there?
   - What tests should the AI create?
   - What questions do we have for Product?

   They talk it through with Product, who updates Part 2. QA reviews the item in
   `qa/` at the same time. When Dev and Product are both happy, they sign
   `build-signoff: Alex and Sam 2026-10-31 round 1`. **That is sign-off 2.**
   Endpoints and models are the Developers' own, so they sign `buildSignoff`
   alone.

4. **Translate it.**

   ```
   /translate example/ClothingWebsite/userLogin.md
   ```

   Claude reads only `ai-only/Project_digest.md`, then writes the item's spec to the
   mirrored path in `ai-only/`, e.g. `example/ai-only/ClothingWebsite/userLogin.md`.

5. **Answer its `UNKNOWN`s**, as above. A build won't start while any is open,
   nor until both sign-offs cover the item's current round and QA's review says
   `happy`. `node tools/brief-lint.mjs --ready <brief>` says what is missing. A
   new change round needs new sign-offs.

---

## Building

Once a spec has no open `UNKNOWN`s:

```
/build example/ai-only/ClothingWebsite/userLogin.md
```

Claude will:
0. **Scaffold** (first build in a solution only) — create the repo skeleton from
   the layout, tests and commands in `_solution.md`, as its own approved plan.
1. **Plan** — opening with an **approval card**: ten plain lines saying what
   changes, which deliverable it advances, what it reuses, which rules it
   touches, the debt expected, and `Unknowns: 0`. You approve from the card;
   the plan under it is for the AI.
2. **Execute** — smallest change first, treating existing code as production.
3. **Report back** — record what it did and the tests it created in the spec, and
   update `ai-only/Code_map.md`: every method it created or changed, one line
   on what it does, and which other files/methods it uses.
4. **Declare debt** — list anything unfinished or any technical debt, instead of
   thrashing on it, each as `D1`, `D2`, … Run `/debt` to decide on it: pay it down
   in the next change round, or accept it in the brief's accepted-debt part.

Every acceptance check in the spec has an ID (`C1`, `C2`, …), and each test names
the check it proves, as `userLogin#C2`. `node tools/check.mjs` fails a built item
whose check no test names, and a test naming a check that isn't there.

**Then get a second opinion** before you review. Ideally use a fresh session, or
another model:

```
/verify example/ai-only/ClothingWebsite/userLogin.md
```

It gives each check a verdict (*proves*, *weak*, *missing* or *failing*) with
the file and line, and says what no check covers. It reports; it never fixes.

---

## QA sign-off (QA's own track)

QA checks the work from outside and signs it off. The AI that builds never reads `qa/`.

1. **Review before work starts.** Copy `_forms/qa-review.md` to
   `qa/<solution>/<item>.md` and answer its six questions. Send questions for
   Product to Product.
2. **Write your tests** into `qa/regression.md`, one row each, marked `manual`
   or `automated`.
3. **Ask for help when you want it:**

   ```
   /qa automate ClothingWebsite/userLogin.md
   /qa run
   ```

   Claude plans first and waits for your approval. It writes the automation in
   the solution's repo and fills in the row, and adds the `regression` command to
   the pipeline. It reports failures; it never fixes them.
4. **Sign off.** When a deliverable is built, run the suite and add a row to
   `qa/signoff.md`. `node tools/brief-lint.mjs` shows what is waiting on you.

---

## Iterating

Don't rewrite the form. Add a bullet under the **changes-over-time** section of a
Markdown brief (e.g. "Round 2: add 'remember me'"), or an entry to the
**`changesOverTime.rounds`** list of a JSON brief. Then re-run `/translate` on it
and `/build` again. Keep each change small.

---

## The commands at a glance

| Command | What it does |
|---------|--------------|
| `/draft [folder]` | **Existing codebase?** Fill the project brief in from the code — every answer marked with where it came from and how sure it is, and at most five multiple-choice questions at the end. Saved as `status: drafted`; you accept it by reading it and setting `filled`. |
| `/translate <brief>` | Turn a filled-in brief (project, solution or item) into a spec under `ai-only/`: one sourced line per fact, gaps marked `UNKNOWN`. |
| `/product [idea or brief]` | Plan an idea with Product: a few multiple-choice questions, then Parts 1–2 of a page brief drafted in their words. Product accepts it and signs; the AI never signs. |
| `/new-item <type> <solution> <name>` | Copy a blank `page` / `endpoint` / `model` form into a solution folder, ready to fill in. |
| `/build <spec>` | Build the next iteration of an approved spec — plan, execute, report, log debt. |
| `/verify <spec>` | A second opinion after a build, best from a fresh session or another model: every check gets a verdict (proves, weak, missing, failing) with a file and line. Reports, never fixes. |
| `/debt [project]` | Walk through the open debt builds declared: for each, pay it down next (a change round), accept it (with a reason), or leave it. Drafts your decision into the brief; never decides, never signs. |
| `/pipeline <solution>` | Create the solution's CI/CD pipeline and missing infrastructure from its spec's `infrastructure` block. Secrets are referenced by name only — never written into code. |
| `/qa [automate|script|run]` | Help QA, only when QA asks: write the automation or manual scripts QA asked for, or run the regression suite. Never fixes a failure, never signs off. |
| `/emit-guardrails [targets]` | Write the project's rules out for other agents — `AGENTS.md` (read by Kiro and Cursor too), `CLAUDE.md`, Kiro steering, Cursor rules, Copilot instructions — from the same spec. |

`/translate` and `/build` also trigger automatically when you hand Claude a brief
or ask it to build an approved spec — the commands just give you explicit control.

---

## Checking it still works

```bash
npm run check
```

Runs the tests for the checks themselves (two have silently passed while
reading nothing, so the faults each exists to catch are tested), then every
check, through `node tools/check.mjs`: the **code map** against the code, every item brief's **deliverable**
against the list its Project Brief names, QA's **regression suite and sign-off**, the **round record**, and every line
of every **AI spec** against the brief answer it cites.

None of that proves a *command* behaves — a command is a prompt, and the thing
running it is a model. That pass is [`tools/QA.md`](tools/QA.md): twelve scenarios a
person runs against a real agent, each one naming the failure that would count as
a fail rather than asking whether the output looked plausible.

## The promises (true at every step)

- Build the **smallest thing** that answers the request — no surprise extras.
- Treat anything already built as **working in production**; don't break it.
- If the AI can't finish something, it **says so and writes it down** — no endless retrying.
- **A person reviews and approves** every plan before anything is built, from a short plain-English card.
- **You can read anything the AI writes, and you don't have to.** Every line of a spec names where it came from, and a check reads them for you.
- **Secret values never go into code** — settings are referenced by name; values live in secret stores you control.
- **Infrastructure and pipelines are their own approved plans** — never a side effect of building a feature.
