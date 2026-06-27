# Template

This folder is the working layout for a project built with the CooperativeAICoding framework. **People** fill in plain-English forms; **Claude** translates them into structured specs, mirroring the same folders.

## Layout

```
template/
├─ Project_brief.md              ← fill in once (the whole project)
├─ _forms/                       ← blank master forms — copy these, don't fill them in place
│  ├─ page.md                    ← one per page
│  ├─ endpoint.md                ← one per endpoint
│  └─ database-model.md          ← one per data model / table
│
├─ <solution>/                   ← one folder per solution (you create these)
│  └─ <page>.md                  ← a filled page form, plus its endpoint/model forms
│
└─ claude-only/                  ← Claude's side — no human input
   ├─ 1-translate-to-claude.md   ← the bridge: turns a form into a structured spec + skills
   ├─ 2-claude-system.template.md← the shape Claude's specs come back in
   └─ <solution>/<page>.md       ← Claude mirrors your solution folders here
```

## How to use it

1. **Fill in [`Project_brief.md`](Project_brief.md)** — once, for the whole project. List your solutions here (e.g. `frontEnd`, `backend`).

2. **Create a folder per solution.** For each solution, make a folder under `template/` — e.g. `frontEnd/`, `backend/`.

3. **Add a page.** Copy [`_forms/page.md`](_forms/page.md) into the right solution folder and name it after the page:
   - `frontEnd/page1.md`
   - `backend/userLogin.md`

4. **Add detail.** For each endpoint or data model that page needs, copy [`_forms/endpoint.md`](_forms/endpoint.md) and [`_forms/database-model.md`](_forms/database-model.md) into the same solution folder, and link them from the page.

5. **Translate.** Hand any filled-in form to Claude using [`claude-only/1-translate-to-claude.md`](claude-only/1-translate-to-claude.md). Claude returns a structured spec **plus the skills it needs**, and saves it in `claude-only/` mirroring your folders — e.g. `frontEnd/page1.md` → `claude-only/frontEnd/page1.md`.

6. **Check and approve.** Read the spec back, fix anything in plain English, then let the AI build — smallest change first, one page at a time.

## Why two sides

- **You write in plain English.** No jargon, no prompt-writing. If you can explain it to a colleague, you can fill in a form.
- **Claude translates, not you.** The bridge turns your words into the labelled structure the AI follows best, and **lists the skills** it needs — for the project and each page. A long or surprising skills list is your cue that something is too big or misunderstood.
- **The folders mirror each other**, so every human page has exactly one matching Claude spec, organised by solution.

## Ground rules (carried through every step)

- Build the **smallest change** that answers the request — no surprise extras.
- Treat existing code as **working in production**; don't break it.
- **Write down** technical debt and anything unfinished instead of retrying endlessly.
- A **person approves** every plan before it's built.
