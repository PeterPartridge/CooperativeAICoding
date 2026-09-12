# CooperativeAICoding

> Note: the local repo folder and the `CoperativeAI` solution names use the historical spelling "Coperative"; the framework itself is "CooperativeAICoding".

A framework that gives **Product, Developers, and AI** a single, shared way of working — so that software is built to clear objectives, within agreed technical guardrails, without the AI wandering off and burning tokens rebuilding things that already work.

Development is a team game, and normally this would involve Product working with Developers and Quality Assurance to build a good product, with continuous feedback from Product to Developers, Developers to Product, and QA to Developers and Product — all about capabilities, general product functionality, and look and feel.

## The Problem

AI allows us to move faster, but this also means communication involves AI putting its own spin on the product, the coding, and how the QA is written. The plan of this framework is to make AI part of the team and stop AI from going its own way with a product.

AI when given vague or general descriptions tends to:

- get lost and add endpoints or features that weren't asked for,
- spend a lot of tokens creating, then recreating, the same work, and
- produce large-scale changes at high speed that overwhelm teams and destabilise production.

The goal is to give AI and all team members a source of truth for the product. Create **guardrails** around this so AI can build a solution that developers can maintain, following the Product flow, and also give AI a place to feed back what it cannot do. This also allows developers to keep to the idea of changing as little production code as possible and to use AI to create more testable code.

## How It Works

The framework is defined in three areas:
- The Project brief, which is the why we are doing this, plus general development rules and structure, where each solution's code lives (including across multiple repositories), infrastructure/secrets policy, and gives AI the software engineering practices to employ and how the developers it is working with define these ideas.
- The solution specification, which is where developers define the reason for each solution, give AI the solution-specific guidance, and set it up to successfully move quickly — including its repo scaffold (file layout, tests, commands), its security rules, and the infrastructure and pipeline it needs. Solutions can start from named **boilerplates** (a scaffold preset plus a security baseline) in [`template/_forms/boilerplates.json`](template/_forms/boilerplates.json) instead of being hand-written from scratch.
- The **item** — one page, one endpoint, or one database model — which defines the purpose of the single thing we are creating and what we need from it, and is designed to be built iteratively. Items can declare what must be built before them, so the AI never guesses at build order across a multi-solution project. AI can do the task and, instead of burning tokens trying to implement something it can't understand, it says "I can't implement this" and allows the developers to tell it how to implement it, or go to Product and rethink the feature.

### Global Setup

Before any item is built, Product and Developers define the shared rules:

- **Objectives & customers (Product)** — what the software is for and who it serves.
- **Technology & formats (Developers)** — the tech stack, the platforms the solution must run on, and the formats it must support.
- **Coding standards** — general techniques the AI must follow (e.g. DRY, SOLID). Each standard must be defined: what it means here and how the AI should apply it.
- **Frameworks** — which global frameworks are in use and how they should be upgraded.
- **Security** — how users are authenticated, how endpoints are protected, and how permissions are enforced.
- **Design** — a place for Product to link UI/UX references, attach images or descriptions, and define their customers.

The aim of the technology rules is that any new endpoint the AI creates works with the target platform and is written so that build errors are less likely.

### Items

Once the global setup is complete, the system is broken into **sub-sections**, and each sub-section is an **item** — the smallest thing this framework plans, builds and iterates. An item comes in one of three kinds, each with its own form:

| Kind | What it is | Form |
|------|------------|------|
| **Page** | one screen, panel, or command group of a website or application | [`page.md`](template/_forms/page.md) |
| **Endpoint** | one API resource and its operations | [`endpoint.json`](template/_forms/endpoint.json) |
| **Model** | one table or data model | [`database-model.json`](template/_forms/database-model.json) |

**Nothing here assumes a front end.** A backend-only project has no pages at all — it is endpoints and models, and everything below reads the same for them. *Item* is the word the commands already use: `/new-item page|endpoint|model`.

Each item also names the **deliverable** it works towards — see [Deliverables](#deliverables), below.

Each item is defined **once** by Product, then built up **iteratively** by Developers — starting from the simplest working version and growing toward the final system one iteration at a time (changing data models, adding behaviour, and so on).

#### Item Layout

**Product — fixed question (asked once):**
- *Why do we have this item?* — the overall objective of this page, endpoint, or model.

**Product — iterative questions:**
- How should it look? *(pages and screens)*
- What information do we want to record?
- What are the use cases? Who uses this item, and how do they use it under different conditions?
- Who should be able to use it? (This sets the security expectations for developers.)

**Developers — questions:**
- What should the data model look like?
- Is there anything that must **not** be saved permanently, or must survive between screens? (A constraint if there is one — not a design to impose.)
- How will we know it works? What must be true for this to be accepted?
- What endpoints should be used?

## The AI Workflow

For each item (and each iteration), the AI follows a defined loop:

0. **Scaffold** — the first time an approved item is built in a solution with no code yet, the AI creates the repo skeleton from that solution's spec (a named boilerplate, or its own file layout/tests/commands) as its own approved plan, before any feature is built.
1. **Plan** — the AI generates a plan from the questions above, with a summary at the top and bullet-point changes describing how each use case will be implemented. It checks the item's declared dependencies are already built, checks its **code map** and reuses existing methods rather than rebuilding them, and confirms the change doesn't need new infrastructure (which is its own approved plan, never a side effect of a feature).
2. **Review & execute** — the developer reviews and updates the plan, then executes it.
3. **Report back** — once complete, the AI runs the solution's test/build commands and updates the plan document with what it did, how each use case was implemented, and what test scenarios it created. It also updates the **code map** (`claude-only/Code_map.md`): one row per method it created or changed — what it does in one line, and which other files and methods it uses.
4. **Declare debt** — the AI lists any technical debt it created or anything it failed to implement.

> The AI should **not** spend ages trying to fix or reimagine something. It builds the item simply and clearly records where it fell short and what debt it introduced.

## Iterations

After the first build, each further iteration defines **what needs to change**:

- Change in use case?
- Change in tests?
- Change in UI/UX?
- Change in technology?
- Change in data model?
- Change in endpoints?
- How should existing technical debt or earlier AI failures be addressed?

### Deliverables

Iterating needs something to iterate **towards**, or "smallest change" just means "smallest change forever".

The Project Brief names the **deliverables in order**, each with what makes it done — the first is usually the **MVP**, the smallest version genuinely worth putting in front of someone. Every item names the deliverable it serves, so a build says which one the change advances.

**A deliverable is a stopping point, not a date.** When the last item naming it is built, the AI stops there, says what the deliverable now does end to end, and waits — because a point for people to evaluate direction is worth nothing if the AI builds straight past it. That is the whole reason for naming them.

**Guiding principles for changes:**

- The AI should change **only** what the change case requires, making the **smallest possible** change to avoid breaking production code.
- Assume all existing code is working in production — even if it looks broken.
- The AI should **score each change** by how token-intensive it is likely to be.
- **Secret values never go into code, config, or logs** — they're referenced by name from a store the infrastructure block points at.
- **Infrastructure and pipelines are their own approved plans** — never a side effect of building a feature (see `/pipeline`, below).

> This is not an exhaustive list. Product and Developers need space to define what else each item requires and how the AI should implement those changes.

## Decisions taken deliberately

Things this framework was asked for and chose not to do, recorded so they don't have to be re-argued:

- **"Item", not "page".** A page is one *kind* of item, alongside endpoints and database models. A backend-only project has no pages and loses nothing.
- **A testing floor, not a list of tests.** The Project Brief states the level of cover expected of every change and what isn't worth testing; items list their own acceptance checks on top. A list of things to test reads to an AI as permission to skip everything not on it.
- **Constraints, not implementation answers.** Questions ask what must be true of the product, not how to build it — "the basket survives moving between pages", never "hold the basket in memory". An answer about mechanism becomes a requirement the AI then honours, and a passing thought turns into a design nobody chose.
- **Plain English, not Given/When/Then.** Gherkin is more precise and it is not free: a form that has to be written in a syntax is a form Product stops filling in, and the briefs only work because anyone can answer them. Precision is bought back where it pays — the acceptance checks, the endpoint and model forms (which are structured JSON), and the test cases in the app's Test environment, which is the one place a Given/When/Then shape could still earn its keep.
- **Deliverables as stopping points, not dates.** They exist to force a pause for evaluating direction, which a date does not do.

## How this differs from OpenSpec, Kiro, and friends

Spec-driven development is not a new idea and this is not the only tool doing it. Two come up every time: **[OpenSpec](https://openspec.dev)**, which is free, and **[Kiro](https://kiro.dev)**, which is not. *(Read September 2026. All three move — if this section is stale, it is this repository's fault, not theirs.)*

OpenSpec is a CLI you install with npm. It keeps living requirements in `openspec/specs/`, in-flight work in `changes/`, and finished work in `archive/` by date, driven by five commands: explore, propose, apply, verify, archive. Requirements are SHALL statements with WHEN/THEN scenarios. It works with thirty-plus coding agents and has a year of monthly releases behind it.

**The difference that matters most is who writes the source of truth.** In OpenSpec the AI drafts the spec and you review it. Here, *people* answer plain-English questions and the AI translates them — it never authors the brief it will later build from. Both are defensible, and they fail differently: reviewing a generated spec is exactly where "it wrote what it felt like and I skimmed it" lives, while ours costs you real typing before anything happens, and a form nobody fills in produces nothing at all.

| | OpenSpec | This |
|---|---|---|
| The spec is written by | the AI; you review it | people; the AI translates it |
| Aimed at | a developer with a coding agent | Product, Developers and QA, as separate roles |
| Requirements are | SHALL + WHEN/THEN scenarios | plain English (see *Decisions taken deliberately*, above) |
| A change is | a proposal folder, archived when applied | a round appended to the item's brief, which is permanent |
| Repositories | the one you initialise it in | several, each solution naming its repo and local path |
| Agents | thirty-plus, generated per tool | Claude Code; the app adds Ollama and Claude subscriptions |

### What OpenSpec does well

- **Starting costs nothing.** One npm command, and it generates the command files for whichever agent you already use. Copying a folder — what this framework asks — is more friction than that.
- **Agent-agnostic in practice, not in ambition.** Thirty-plus tools, kept working across releases. This is the single biggest thing it has and we don't.
- **A change is a delta, not an edit.** In-flight work is a folder of its own and the living spec stays clean, so "what is being changed right now" is always answerable.
- **Verify is its own step.** Checking the implementation against the spec is a command somebody can be made to run, rather than a good intention at the end of a build.
- **Precise without being a syntax tax.** SHALL and WHEN/THEN are checkable, and cheap enough that engineers actually write them.
- **It is a year old.** Other people have already found the edges. Nothing here has that.

### What OpenSpec does badly

Our reading, and a trade it has chosen rather than a list of bugs:

- **The AI writes the thing meant to constrain the AI.** Human review is the only gate, and review of generated prose is the weakest gate in software.
- **No seat for anyone but a developer.** Nothing separates Product's "why" from a developer's "how", so a spec folder is all Product and QA get.
- **One repository.** Real products span several; nothing in it knows that.
- **No cost control.** Which model, how hard it thinks, and what a run spent are all outside its scope — while its own docs recommend high-reasoning models.
- **Nothing flows back.** There is no channel for the AI to declare debt, or to say "I can't implement this" and have that become work somebody sees. The specification is one-directional.
- **No reuse ledger**, so nothing stops an agent rebuilding what already exists — the failure this framework's code map was built for.
- **The why scatters.** Archiving by date is tidy, but a feature's reasoning ends up spread across dated folders instead of sitting beside the thing it explains.

### And Kiro

Second-hand — from a developer who uses it daily, not from our own use. It does steering files per repository, specialist subagents (one that knows Terraform, one Ansible, one that reads AWS), interactive design before the agent runs, and it is an IDE as well as an agent. It is more mature than anything here and you are paying for it. Being free is not the interesting difference; **feedback running back from the AI is**, and cost, and the multi-repository case.

### Choose accordingly

One developer, one repository, specs without ceremony — OpenSpec is the lighter tool, and it would be dishonest to pretend otherwise. A team where Product and QA have to be in the loop, work spans several repositories, and somebody has to see the cost and the debt — that is what this is for.

## Templates

The working layout lives in [`template/`](template/). **You** fill in the forms — prose briefs (the project brief and page briefs) are **Markdown** you answer under question headings; record-style forms (endpoints, database models, solution specs) are **JSON** with `answer` fields and entry lists. Either way you write plain English; **Claude** translates them into structured specs — working out the **skills** it needs — and mirrors your folders on its side.

- **[`template/Project_brief.md`](template/Project_brief.md)** — plain questions about the whole project, including where each solution's code lives and your infrastructure/secrets policy. Filled in once.
- **[`template/_forms/`](template/_forms/)** — blank master forms to copy: one [`application-spec.json`](template/_forms/application-spec.json) for every solution (set its `solutionType` to `website`, `api`, `database`, or `application`), item forms ([`page.md`](template/_forms/page.md), [`endpoint.json`](template/_forms/endpoint.json), [`database-model.json`](template/_forms/database-model.json)), and [`boilerplates.json`](template/_forms/boilerplates.json) — named scaffold presets and security baselines a solution spec can adopt by name.
- **`template/<solution>/`** — one folder per solution (e.g. `frontEnd/`, `backend/`); each item is a file inside it, like `frontEnd/page1.md` or `backend/userLogin.md`.
- **[`template/claude-only/`](template/claude-only/)** — Claude's side (no human input): the [translate bridge](template/claude-only/1-translate-to-claude.md), the [spec shape](template/claude-only/2-claude-system.template.md), and the [code map](template/claude-only/3-code-map.template.md) — Claude's running inventory of every method it built, so it reuses instead of rebuilding. Claude mirrors your solution folders here, e.g. `frontEnd/page1.md` → `claude-only/frontEnd/page1.md`.

See [`template/README.md`](template/README.md) for the full layout and step-by-step flow.

## Getting started

**One command, into any project:**

```bash
npx github:PeterPartridge/CooperativeAICoding init
```

That puts the project brief, the blank forms, the four commands and the two
checks into the folder you run it in — on Windows, macOS or Linux, with nothing
installed and nothing to build. It never overwrites: a file that already exists
is left alone and named in the report, so running it again is how you pick up
forms added since. Add `--dry-run` to see it first.

**Just want the desktop app, or dev on Linux?** [`INSTALL.md`](INSTALL.md) has the installers and packages for both platforms, how to build from source, and the framework-only path — which needs no binary at all and runs wherever Claude Code runs.

New here? **[`HOW-TO-USE.md`](HOW-TO-USE.md)** is the practical, start-to-finish walkthrough — filling in a brief, translating it, building, and iterating. It uses three Claude Code slash commands:

- **`/draft [folder]`** — for a codebase that already exists: fill the brief in from the code, sourced and marked, with a few multiple-choice questions at the end instead of a blank form. The AI's answers stay the AI's until you accept them.
- **`/translate <brief>`** — turn a filled-in brief into a structured spec + skills.
- **`/new-item <type> <solution> <name>`** — copy a blank page/endpoint/model form into a solution folder.
- **`/build <spec>`** — build the next iteration of an approved spec, then report back and log debt.
- **`/pipeline <solution>`** — create the solution's CI/CD pipeline and missing infrastructure from its spec, as its own approved plan. Secret values are never written into code — they're referenced by name from stores you control.
