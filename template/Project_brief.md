---
form: project-brief
project: ""
status: blank            # blank | filled | approved
---

# Project Brief — <Project Name>

> **Who fills this in:** the people who own the idea (Product) and the people who will build it (Developers), together.
>
> **How:** answer each question in plain English directly under its heading. Lines starting with `>` are guidance for you — anything else you write under a heading is your answer. Write like you're explaining it to a new colleague; no technical wording needed. Leave a question unanswered if you genuinely don't know yet, but try. When you're done, set `status: filled` at the top.
>
> Then the brief gets handed to Claude using the bridge in [`claude-only/1-translate-to-claude.md`](claude-only/1-translate-to-claude.md), which turns your answers into instructions the AI can follow.
>
> **How the folders are laid out:** this project brief lives at the root. Each **solution** gets its own folder, with a spec file at its root that defines the solution's technology, plus one file per page/endpoint/model. See [`example/`](example/) for a worked Clothing project. Every solution folder's spec is a copy of the same [`_forms/application-spec.json`](_forms/application-spec.json) — set its `solutionType` to `website`, `api`, `database`, or `application`:
> - **Website / front-end** → `application-spec.json` (`solutionType: website`) + pages from [`_forms/page.md`](_forms/page.md) (e.g. `ClothingWebsite/userLogin.md`)
> - **API** → `application-spec.json` (`solutionType: api`) + resources from [`_forms/endpoint.json`](_forms/endpoint.json) (e.g. `ClothingAPI/Login.json`)
> - **Database** → `application-spec.json` (`solutionType: database`) + tables from [`_forms/database-model.json`](_forms/database-model.json) (e.g. `ClothingDatabase/UserCredentials.json`)
> - **Standalone application (CLI/TUI/desktop)** → `application-spec.json` (`solutionType: application`) + screens from `page.md` (e.g. `CoperativeAI/mainScreen.md`)

---

## Part 1 — The Idea *(Product answers this)*

### purpose — In one or two sentences, what is the purpose of this software?
> Example: "An app that lets dog walkers book and get paid for walks."

### problem — What problem does it solve, and for whom?

### users — Who will use this software?
> List the kinds of people. For each, say what they're trying to get done.
> - Person/group: … — they want to: …

### apps-you-like — Are there any apps or websites you like?
> Links or names are fine.

### apps-to-avoid — Are there any apps or websites you want to avoid copying?
> Links or names are fine.

---

## Part 2 — How Should We Build the Solution(s) *(Developers answer this)*

> Each **solution** (API, website, database, etc.) gets its own folder with a spec file that defines its specific technology — language, framework, hosting, database engine. The questions here set the **overall** direction; the solution specs fill in the detail.

### platforms — What platforms would this development need to run on?
> e.g. a website, Android, iOS, Windows service, etc.

### repo-structure — Is this a single repo or multi purpose repo?
> e.g. one combined codebase, or separate repos for each service/app.

### solutions — List each solution and where its code lives.
> One bullet per solution, so the AI always builds in the right place — especially
> when solutions live in separate repositories. Give the repository (URL, or "this
> repo") and the local folder path where it's checked out relative to this project.
> - Name: … — type: website / API / database — repo: … — local path: …
> - e.g. Name: ClothingAPI — type: API — repo: github.com/you/clothing-api — local path: ../clothing-api

### dev-rules — Software development rules for the codebase.
> List rules for how the code will be written in general, plus software development practices to follow and how you define them — the AI must use your definition.
> e.g. Build this using DRY (Do not repeat yourself) — if you are repeating code three times, put that code into a shared library where it can be accessed.
> All frontend code will use CamelCase for page names.

### roles — List the roles or claims used across the application.
> The shared vocabulary every solution authorises against.
> e.g. Admin, SuperAdmin, Manager.

### hosting — What technology will host these solutions?
> e.g. a particular hosting service, an app store, your own servers. "Not decided" is not a valid answer. (Each solution spec can refine this.)

### database-technology — What database technology will the solution(s) use?
> e.g. PostgreSQL, MySQL, SQL Server, MongoDB. "Not decided" is not a valid answer. (Each Database solution restates its engine in its `application-spec.json`.)

### environments — What environments will this project have, and which may the AI deploy to?
> e.g. "dev (AI may deploy), production (people deploy after review)." Each solution spec can refine this.

### infrastructure-policy — Who creates infrastructure, and with what tool? Where do secrets live?
> The AI only ever creates infrastructure as its own approved plan — never as a side
> effect of building a page. And **secret values are never written into code or
> committed config** — say where they live so the AI can reference them by name.
> e.g. "The AI writes Bicep in each solution's infra/ folder; the pipeline deploys it.
> Secrets live in Azure Key Vault and GitHub Actions secrets."

---

## Part 3 — Look & Feel *(Product answers this)*

### designs — Do you have any designs, sketches, screenshots, or examples?
> Paste links, attach images, or just describe the feeling you want (e.g. "clean and friendly, lots of white space").

---

## Part 4 — When to Use Each AI Model *(Product + Developers)*

> AI models trade cost against capability. Cheaper, faster models are great for simple, well-defined work; more powerful, pricier models are worth it for complex or high-risk work. Tell the AI when to reach for each, so it doesn't overspend on easy tasks or under-power hard ones.

### cheapest-model — When should we use the cheapest, fastest model?
> Simple, repetitive, or low-risk tasks.

### mid-range-model — When should we use the mid-range model?
> Building medium and advanced complexity tasks.

### most-capable-model — When should we use the most capable (and most expensive) model?
> Best for complex, ambiguous, or high-stakes bugs and features.

### effort-levels — How hard should the model think (effort level) for different kinds of work?
> Separate from *which* model, you can dial how much effort it spends reasoning before it acts. Higher effort = more careful, slower, more tokens; lower effort = faster and cheaper. Say when to use each.
> - **Low effort:** simple, well-defined tasks where the answer is obvious.
> - **Medium effort:** everyday building and changes.
> - **High effort:** tricky logic, architecture decisions, or anything risky.

---

## Part 5 — Anything Else

### anything-else — Is there anything important we haven't asked about?

---

### The promises this project makes (no need to edit — just so everyone's agreed)

- The AI builds the **smallest thing** that answers the request — no surprise extras.
- We treat anything already built as **working in production**, and avoid breaking it.
- If the AI can't finish something, it **says so and writes it down** instead of endlessly retrying.
- Every change is **reviewed by a person** before it goes live.
