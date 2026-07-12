---
form: page-brief
page: ""
solution: ""
depends-on: []           # briefs that must be built first, e.g. [ClothingAPI/Login.json]
status: blank            # blank | filled | approved | built
---

# Page Brief — <Page Name>

> **Who fills this in:** Product describes what the page is for; Developers add the building details. One of these per page (a page is one screen or section of the project).
>
> **Where it goes:** copy this file into the website **solution folder**, named after the page — e.g. `ClothingWebsite/userLogin.md`. Fill in `page` and `solution` at the top.
>
> **How:** answer each question in plain English directly under its heading, same as the Project Brief. Lines starting with `>` are guidance — anything else you write under a heading is your answer. When you're done, set `status: filled` and hand it to Claude using the bridge in [`claude-only/1-translate-to-claude.md`](../claude-only/1-translate-to-claude.md).

---

## Part 1 — What This Page Is For *(Product answers — set once)*

### why-exists — Why does this page exist?
> The one main job of this page. This shouldn't change much over time.
> Example: "So a customer can see their past orders."

---

## Part 2 — What It Should Do *(Product answers — can change each round)*

### actions — What should someone be able to do on this page?
> List the actions, with who does them.
> - Someone (who: …) can: …

### look — What should it look like?
> Link a sketch, or describe it. "Like the rest of the app" is fine.

### information — What information does this page show or collect?
> List the bits of information, in everyday words, one bullet each.

### who-can-use — Who is allowed to use this page?
> Everyone? Only logged-in users? Only admins?

---

## Part 3 — Building Details *(Developers answer)*

> For each endpoint this page needs, copy [`_forms/endpoint.json`](../_forms/endpoint.json) into this solution folder. For each data model it stores, copy [`_forms/database-model.json`](../_forms/database-model.json). Link them from here.

### data-stored — What information needs to be stored, and what does each bit look like?
> e.g. "Order number (a number), Date (a date), Status (one of: placed / shipped / delivered)."
> For anything beyond a couple of fields, capture the full detail in a copy of [`_forms/database-model.json`](../_forms/database-model.json) and link it here.

### in-memory — Does anything need to be remembered while the page is open (not saved permanently)?
> e.g. items in a basket before checkout. "No" is common.

### tests — How will we know it works? What should we test?
> Plain checks are fine, one bullet each: "If I'm not logged in, I can't see this page."

### limits — Any known limits or things to watch out for?
> e.g. "This page can get slow if there are thousands of orders."

### model-and-effort — Which AI model and effort level should this page use by default?
> Pick from the project's tiers (see the Project Brief): a simple page might be "cheapest model, low effort"; a tricky one "most capable, high effort." You can override this for individual changes later.

---

## Part 4 — changes-over-time

> You don't fill this in at the start. Each time you come back to improve the page, add a bullet describing **what you want to change** — a new action, a design tweak, a fix. Keep changes small.
> - Round 2: …
