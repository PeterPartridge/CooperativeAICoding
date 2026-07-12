# How to Use CooperativeAICoding

A practical, start-to-finish guide. The idea: **you** describe what you want in
plain English; **Claude** translates that into structured specs and builds from
them — making the smallest change each time, and writing down anything it can't do.

For the framework's reasoning, see the [main README](README.md). For the folder
layout, see [`template/README.md`](template/README.md). This file is just *how to run it*.

---

## The loop in one picture

```
Fill a form                 →   Translate to a spec   →   Review & approve   →   Build   →   Iterate
   (you, in template/)          (/translate)              (you)                 (/build)    (add a change round)
```

Forms come in two shapes, matched to their content. Prose briefs (the project
brief and page briefs) are **Markdown**: write your plain-English answer under
each question heading — lines starting with `>` are guidance, everything else is
yours. Record-style forms (endpoints, database models, solution specs) are
**JSON**: fill in the `answer` fields and entry lists. Everything Claude
generates lands in `template/claude-only/`, mirroring your folders.

---

## First-time setup (once per project)

1. **Fill in the project brief.** Open [`template/Project_brief.md`](template/Project_brief.md)
   and answer each question in plain English under its heading (the `>` lines are
   guidance and examples). Set `status: filled` at the top when you're done. This
   is the whole-project "why," the tech direction, the house rules, security, and
   your model/effort tiers.

2. **Translate it.** Run:

   ```
   /translate template/Project_brief.md
   ```

   Claude produces a **System Spec**, a compact **Project Digest**, and a
   **Project Skills** list, and saves them to `template/claude-only/Project_system.md`.

3. **Read it back.** Check nothing was invented or misunderstood. If the skills
   list looks surprisingly long, that's a signal the project is too big — split it.
   Fix anything by telling Claude in plain English and re-running `/translate`.

---

## Adding a piece of the product (per page / endpoint / table)

Each solution (website, API, database) is a folder; each page/endpoint/model is a
file inside it.

1. **Scaffold the form.** For example, a login page in the `ClothingWebsite` solution:

   ```
   /new-item page ClothingWebsite userLogin
   ```

   This copies the right blank form to `template/ClothingWebsite/userLogin.md`
   (pages are Markdown; endpoints and models are JSON, e.g.
   `template/ClothingAPI/Login.json`). A brand-new solution folder also needs its
   spec — `Website-spec.json` / `API-spec.json` / `Database-spec.json`; the command reminds you.

2. **Fill it in.** Answer in plain English — under the question headings in a
   Markdown form, or in the `answer` fields of a JSON one: what the page is for,
   who uses it, what it shows/stores, how you'll know it works, and its default
   model/effort.

3. **Translate it.**

   ```
   /translate template/ClothingWebsite/userLogin.md
   ```

   Claude reads only the **Project Digest** (not the whole project spec — that keeps
   it token-efficient), then produces a **Page Spec**, **Page Skills**, and a short
   **PLAN**, saved to `template/claude-only/ClothingWebsite/userLogin.md`.

4. **Approve the plan.** Read it back and approve, or correct it in plain English.

---

## Building

Once a spec is approved:

```
/build template/claude-only/ClothingWebsite/userLogin.md
```

Claude will:
1. **Plan** — summary + bullet changes, and wait for your go-ahead.
2. **Execute** — smallest change first, treating existing code as production.
3. **Report back** — record what it did and the tests it created, in the spec.
4. **Declare debt** — list anything unfinished or any technical debt, instead of
   thrashing on it.

---

## Iterating

Don't rewrite the form. Add a bullet under the **changes-over-time** section of a
Markdown brief (e.g. "Round 2: add 'remember me'"), or a note in a JSON form's
relevant field. Then re-run `/translate` on it and `/build` again. Keep each
change small.

---

## The commands at a glance

| Command | What it does |
|---------|--------------|
| `/translate <brief>` | Turn a filled-in brief (project or item) into a structured spec + skills under `claude-only/`. |
| `/new-item <type> <solution> <name>` | Copy a blank `page` / `endpoint` / `model` form into a solution folder, ready to fill in. |
| `/build <spec>` | Build the next iteration of an approved spec — plan, execute, report, log debt. |

`/translate` and `/build` also trigger automatically when you hand Claude a brief
or ask it to build an approved spec — the commands just give you explicit control.

---

## The promises (true at every step)

- Build the **smallest thing** that answers the request — no surprise extras.
- Treat anything already built as **working in production**; don't break it.
- If Claude can't finish something, it **says so and writes it down** — no endless retrying.
- **A person reviews and approves** every plan before anything is built.
