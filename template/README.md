# Template

This folder is the working layout for a project built with the CooperativeAICoding framework. **People** fill in forms in plain English; **Claude** translates them into structured specs, mirroring the same folders.

## Layout

```
template/
├─ Project_brief.md              ← fill in once (the whole project)
├─ _forms/                       ← blank master forms — copy these, don't fill them in place
│  ├─ application-spec.json      ← ONE solution spec for every type — set
│  │                               solutionType: website | api | database | application
│  ├─ boilerplates.json          ← named presets a solution spec adopts by name:
│  │                               scaffolds (layout + tests + commands) and
│  │                               security baselines (HTTPS-only, no secrets in code, …)
│  ├─ page.md                    ← one per website/application screen
│  ├─ endpoint.json              ← one per API resource
│  └─ database-model.json        ← one per data model / table
│
├─ <solution>/                   ← one folder per solution (you create these)
│  ├─ application-spec.json      ← the solution's spec, whatever its solutionType
│  └─ <item>.md|.json            ← its pages (Markdown) / endpoints / models (JSON)
│
└─ claude-only/                  ← Claude's side — no human input
   ├─ 1-translate-to-claude.md   ← the bridge: turns a form into a structured spec + skills
   ├─ 2-claude-system.template.md← the shape Claude's specs come back in
   ├─ 3-code-map.template.md     ← the shape of the code map (below)
   ├─ Code_map.md                ← Claude's inventory of every method it built:
   │                               what it does + which files/methods it uses
   └─ <solution>/<item>.md       ← Claude mirrors your solution folders here
```

**A project is any folder laid out like this whose root holds a `Project_brief.md`** — this `template/` folder is the blank starting copy, `example/` (at the **repo root**, a sibling of `template/`) is a worked Clothing project to copy from, and `application/` (also at the repo root) is a real project: the framework speccing its own desktop app. The `/translate`, `/build`, `/new-item`, and `/pipeline` commands resolve all paths from that project root. The blank master forms and `boilerplates.json` always come from this folder's `_forms/`, whichever project you're in.

**Solutions are typed, but the spec form is one file.** Each solution folder holds one `application-spec.json` describing the whole solution, plus its items. Set `solutionType` to pick which questions apply:

| Solution type (`solutionType`) | Item form | Example |
|---------------------------------|-----------|---------|
| `website` — front-end | `page.md` | `ClothingWebsite/userLogin.md` |
| `api` | `endpoint.json` | `ClothingAPI/Login.json` |
| `database` | `database-model.json` | `ClothingDatabase/UserCredentials.json` |
| `application` — CLI / TUI / desktop | `page.md` (one per screen, panel, or command group) | `CoperativeAI/mainScreen.md` |

The spec's `core`, `accessAndInterface`, and `conventions` blocks hold every type's questions together; each field's `guidance` says which `solutionType`(s) it applies to — leave the rest blank. The `scaffold`, `security`, and `infrastructure` blocks are identical for every type and pull from the same [`boilerplates.json`](_forms/boilerplates.json) presets.

**How the forms work.** Two shapes, matched to their content, and both carry the same metadata (`form`, a name, and `status: blank | filled | approved | built`). Item briefs also declare `depends-on`/`dependsOn` — the briefs that must be built before them (a page depends on its endpoints; an endpoint on its models) — and `/build` refuses to run out of order:

- **Prose briefs are Markdown** (`Project_brief.md`, `page.md`): one `### <id> — <question>` heading per question. Lines starting with `>` are guidance and examples; whatever else you write under the heading is your answer.
- **Record-style forms are JSON** (endpoints, models, solution specs): question objects with `question` / `guidance` / `example`, where you fill in the `answer` fields — plus `entries` lists for rows like operations and database fields.

## How to use it

1. **Fill in [`Project_brief.md`](Project_brief.md)** — once, for the whole project. List your solutions here (e.g. `ClothingWebsite`, `ClothingAPI`, `ClothingDatabase`), each with its repository and local path — solutions can live in separate repos, and this is how the AI knows where to build each one.

2. **Create a folder per solution**, and drop in its spec. Copy [`_forms/application-spec.json`](_forms/application-spec.json) into the folder and set `solutionType` to `website`, `api`, `database`, or `application`. In its `scaffold` block, either name a preset from [`boilerplates.json`](_forms/boilerplates.json) or write your own file layout, test setup, and commands — this is what the AI uses to create the repo skeleton on the first build and to verify every build after. In its `security` block, name a security baseline (HTTPS-only, no secrets in code, deny-by-default auth, …) and add any extra rules — additions only; they can never weaken the baseline.

3. **Add the items.** Copy the matching item form into the same folder and name it after the item:
   - Website page → `page.md` → e.g. `ClothingWebsite/userLogin.md`
   - API resource → `endpoint.json` → e.g. `ClothingAPI/Login.json`
   - Database table → `database-model.json` → e.g. `ClothingDatabase/UserCredentials.json`

4. **Translate.** Hand any filled-in form to Claude using [`claude-only/1-translate-to-claude.md`](claude-only/1-translate-to-claude.md). Claude returns a structured spec **plus the skills it needs**, and saves it in `claude-only/` mirroring your folders — e.g. `ClothingWebsite/userLogin.md` → `claude-only/ClothingWebsite/userLogin.md`.

5. **Check and approve.** Read the spec back, fix anything in plain English, then let the AI build — smallest change first, one item at a time.

See [`example/`](../example/) (at the repo root) for a complete worked project you can copy from.

## Why two sides

- **You write in plain English.** Whether the form is Markdown or JSON, every answer is a plain-English sentence — no jargon, no prompt-writing. If you can explain it to a colleague, you can fill in a form.
- **Claude translates, not you.** The bridge turns your words into the labelled structure the AI follows best, and **lists the skills** it needs — for the project and each page. A long or surprising skills list is your cue that something is too big or misunderstood.
- **The folders mirror each other**, so every human page has exactly one matching Claude spec, organised by solution.

## Ground rules (carried through every step)

- Build the **smallest change** that answers the request — no surprise extras.
- Treat existing code as **working in production**; don't break it.
- **Write down** technical debt and anything unfinished instead of retrying endlessly.
- A **person approves** every plan before it's built.
