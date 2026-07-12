# Template

This folder is the working layout for a project built with the CooperativeAICoding framework. **People** fill in forms in plain English; **Claude** translates them into structured specs, mirroring the same folders.

## Layout

```
template/
├─ Project_brief.md              ← fill in once (the whole project)
├─ _forms/                       ← blank master forms — copy these, don't fill them in place
│  ├─ Website-spec.json          ← solution spec: one per website / front-end
│  ├─ API-spec.json              ← solution spec: one per API
│  ├─ Database-spec.json         ← solution spec: one per database
│  ├─ boilerplates.json          ← named presets a solution spec adopts by name:
│  │                               scaffolds (layout + tests + commands) and
│  │                               security baselines (HTTPS-only, no secrets in code, …)
│  ├─ page.md                    ← one per website page
│  ├─ endpoint.json              ← one per API resource
│  └─ database-model.json        ← one per data model / table
│
├─ <solution>/                   ← one folder per solution (you create these)
│  ├─ <Type>-spec.json           ← the solution's spec (Website / API / Database)
│  └─ <item>.md|.json            ← its pages (Markdown) / endpoints / models (JSON)
│
├─ example/                      ← a worked Clothing project to copy from
│  ├─ ClothingWebsite/  (Website-spec.json + userLogin.md)
│  ├─ ClothingAPI/      (API-spec.json + Login.json)
│  └─ ClothingDatabase/ (Database-spec.json + UserCredentials.json)
│
└─ claude-only/                  ← Claude's side — no human input
   ├─ 1-translate-to-claude.md   ← the bridge: turns a form into a structured spec + skills
   ├─ 2-claude-system.template.md← the shape Claude's specs come back in
   ├─ 3-code-map.template.md     ← the shape of the code map (below)
   ├─ Code_map.md                ← Claude's inventory of every method it built:
   │                               what it does + which files/methods it uses
   └─ <solution>/<item>.md       ← Claude mirrors your solution folders here
```

**Solutions are typed.** Each solution folder holds one **spec file** describing the whole solution, plus its items:

| Solution type | Spec form | Item form | Example |
|---------------|-----------|-----------|---------|
| Website / front-end | `Website-spec.json` | `page.md` | `ClothingWebsite/userLogin.md` |
| API | `API-spec.json` | `endpoint.json` | `ClothingAPI/Login.json` |
| Database | `Database-spec.json` | `database-model.json` | `ClothingDatabase/UserCredentials.json` |

**How the forms work.** Two shapes, matched to their content, and both carry the same metadata (`form`, a name, and `status: blank | filled | approved`):

- **Prose briefs are Markdown** (`Project_brief.md`, `page.md`): one `### <id> — <question>` heading per question. Lines starting with `>` are guidance and examples; whatever else you write under the heading is your answer.
- **Record-style forms are JSON** (endpoints, models, solution specs): question objects with `question` / `guidance` / `example`, where you fill in the `answer` fields — plus `entries` lists for rows like operations and database fields.

## How to use it

1. **Fill in [`Project_brief.md`](Project_brief.md)** — once, for the whole project. List your solutions here (e.g. `ClothingWebsite`, `ClothingAPI`, `ClothingDatabase`), each with its repository and local path — solutions can live in separate repos, and this is how the AI knows where to build each one.

2. **Create a folder per solution**, and drop in its spec. Copy the matching spec form from [`_forms/`](_forms/) into the folder — `Website-spec.json`, `API-spec.json`, or `Database-spec.json`. In its `scaffold` block, either name a preset from [`boilerplates.json`](_forms/boilerplates.json) or write your own file layout, test setup, and commands — this is what the AI uses to create the repo skeleton on the first build and to verify every build after. In its `security` block, name a security baseline (HTTPS-only, no secrets in code, deny-by-default auth, …) and add any extra rules — additions only; they can never weaken the baseline.

3. **Add the items.** Copy the matching item form into the same folder and name it after the item:
   - Website page → `page.md` → e.g. `ClothingWebsite/userLogin.md`
   - API resource → `endpoint.json` → e.g. `ClothingAPI/Login.json`
   - Database table → `database-model.json` → e.g. `ClothingDatabase/UserCredentials.json`

4. **Translate.** Hand any filled-in form to Claude using [`claude-only/1-translate-to-claude.md`](claude-only/1-translate-to-claude.md). Claude returns a structured spec **plus the skills it needs**, and saves it in `claude-only/` mirroring your folders — e.g. `ClothingWebsite/userLogin.md` → `claude-only/ClothingWebsite/userLogin.md`.

5. **Check and approve.** Read the spec back, fix anything in plain English, then let the AI build — smallest change first, one item at a time.

See [`example/`](example/) for a complete worked project you can copy from.

## Why two sides

- **You write in plain English.** Whether the form is Markdown or JSON, every answer is a plain-English sentence — no jargon, no prompt-writing. If you can explain it to a colleague, you can fill in a form.
- **Claude translates, not you.** The bridge turns your words into the labelled structure the AI follows best, and **lists the skills** it needs — for the project and each page. A long or surprising skills list is your cue that something is too big or misunderstood.
- **The folders mirror each other**, so every human page has exactly one matching Claude spec, organised by solution.

## Ground rules (carried through every step)

- Build the **smallest change** that answers the request — no surprise extras.
- Treat existing code as **working in production**; don't break it.
- **Write down** technical debt and anything unfinished instead of retrying endlessly.
- A **person approves** every plan before it's built.
