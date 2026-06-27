# Template

This folder is the working layout for a project built with the CooperativeAICoding framework. **People** fill in plain-English forms; **Claude** translates them into structured specs, mirroring the same folders.

## Layout

```
template/
├─ Project_brief.md              ← fill in once (the whole project)
├─ _forms/                       ← blank master forms — copy these, don't fill them in place
│  ├─ Website-spec.md            ← solution spec: one per website / front-end
│  ├─ API-spec.md                ← solution spec: one per API
│  ├─ Database-spec.md           ← solution spec: one per database
│  ├─ page.md                    ← one per website page
│  ├─ endpoint.md                ← one per API resource
│  └─ database-model.md          ← one per data model / table
│
├─ <solution>/                   ← one folder per solution (you create these)
│  ├─ <Type>-spec.md             ← the solution's spec (Website / API / Database)
│  └─ <item>.md                  ← its pages / endpoints / models
│
├─ example/                      ← a worked Clothing project to copy from
│  ├─ ClothingWebsite/  (Website-spec.md + userLogin.md)
│  ├─ ClothingAPI/      (API-spec.md + Login.md)
│  └─ ClothingDatabase/ (Database-spec.md + UserCredentials.md)
│
└─ claude-only/                  ← Claude's side — no human input
   ├─ 1-translate-to-claude.md   ← the bridge: turns a form into a structured spec + skills
   ├─ 2-claude-system.template.md← the shape Claude's specs come back in
   └─ <solution>/<item>.md       ← Claude mirrors your solution folders here
```

**Solutions are typed.** Each solution folder holds one **spec file** describing the whole solution, plus its items:

| Solution type | Spec form | Item form | Example |
|---------------|-----------|-----------|---------|
| Website / front-end | `Website-spec.md` | `page.md` | `ClothingWebsite/userLogin.md` |
| API | `API-spec.md` | `endpoint.md` | `ClothingAPI/Login.md` |
| Database | `Database-spec.md` | `database-model.md` | `ClothingDatabase/UserCredentials.md` |

## How to use it

1. **Fill in [`Project_brief.md`](Project_brief.md)** — once, for the whole project. List your solutions here (e.g. `ClothingWebsite`, `ClothingAPI`, `ClothingDatabase`).

2. **Create a folder per solution**, and drop in its spec. Copy the matching spec form from [`_forms/`](_forms/) into the folder — `Website-spec.md`, `API-spec.md`, or `Database-spec.md`.

3. **Add the items.** Copy the matching item form into the same folder and name it after the item:
   - Website page → `page.md` → e.g. `ClothingWebsite/userLogin.md`
   - API resource → `endpoint.md` → e.g. `ClothingAPI/Login.md`
   - Database table → `database-model.md` → e.g. `ClothingDatabase/UserCredentials.md`

4. **Translate.** Hand any filled-in form to Claude using [`claude-only/1-translate-to-claude.md`](claude-only/1-translate-to-claude.md). Claude returns a structured spec **plus the skills it needs**, and saves it in `claude-only/` mirroring your folders — e.g. `ClothingWebsite/userLogin.md` → `claude-only/ClothingWebsite/userLogin.md`.

5. **Check and approve.** Read the spec back, fix anything in plain English, then let the AI build — smallest change first, one item at a time.

See [`example/`](example/) for a complete worked project you can copy from.

## Why two sides

- **You write in plain English.** No jargon, no prompt-writing. If you can explain it to a colleague, you can fill in a form.
- **Claude translates, not you.** The bridge turns your words into the labelled structure the AI follows best, and **lists the skills** it needs — for the project and each page. A long or surprising skills list is your cue that something is too big or misunderstood.
- **The folders mirror each other**, so every human page has exactly one matching Claude spec, organised by solution.

## Ground rules (carried through every step)

- Build the **smallest change** that answers the request — no surprise extras.
- Treat existing code as **working in production**; don't break it.
- **Write down** technical debt and anything unfinished instead of retrying endlessly.
- A **person approves** every plan before it's built.
