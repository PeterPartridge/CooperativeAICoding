# Page Brief — <Page Name>

> **Who fills this in:** Product describes what the page is for; Developers add the building details. One of these per page (a page is one screen or section of the project).
>
> **Where it goes:** copy this file into the page's **solution folder**, named after the page — e.g. `frontEnd/page1.md` or `backend/userLogin.md`.
>
> **How:** answer in plain English, same as the Project Brief. Then hand it to Claude using the bridge in **[`claude-only/1-translate-to-claude.md`](../claude-only/1-translate-to-claude.md)**.

---

## Part 1 — What This Page Is For *(Product answers — set once)*

**1. Why does this page exist?**
> The one main job of this page. This shouldn't change much over time.
> Example: "So a customer can see their past orders."

_Your answer:_

---

## Part 2 — What It Should Do *(Product answers — can change each round)*

**2. What should someone be able to do on this page?**
> List the actions, with who does them.

- Someone (who: …) can: …
- Someone (who: …) can: …

**3. What should it look like?**
> Link a sketch, or describe it. "Like the rest of the app" is fine.

_Your answer:_

**4. What information does this page show or collect?**
> List the bits of information, in everyday words.

- …
- …

**5. Who is allowed to use this page?**
> Everyone? Only logged-in users? Only admins?

_Your answer:_

---

## Part 3 — Building Details *(Developers answer)*

> For each endpoint this page needs, copy [`_forms/endpoint.md`](../_forms/endpoint.md) into this solution folder. For each data model it stores, copy [`_forms/database-model.md`](../_forms/database-model.md). Link them from here.

**6. What information needs to be stored, and what does each bit look like?**
> e.g. "Order number (a number), Date (a date), Status (one of: placed / shipped / delivered)."
> For anything beyond a couple of fields, capture the full detail in a copy of [`_forms/database-model.md`](../_forms/database-model.md) and link it here.

- …
- …

**7. Does anything need to be remembered while the page is open (not saved permanently)?**
> e.g. items in a basket before checkout. "No" is common.

_Your answer:_

**8. How will we know it works? What should we test?**
> Plain checks are fine: "If I'm not logged in, I can't see this page."

- [ ] …
- [ ] …

**9. Any known limits or things to watch out for?**
> e.g. "This page can get slow if there are thousands of orders."

_Your answer:_

**10. Which AI model and effort level should this page use by default?**
> Pick from the project's tiers (see the Project Brief): a simple page might be "cheapest model, low effort"; a tricky one "most capable, high effort." You can override this for individual changes later.

_Your answer:_

---

## Part 4 — Changes Over Time

> You don't fill this in at the start. Each time you come back to improve the page, add a short note here describing **what you want to change** — a new action, a design tweak, a fix. Keep changes small.

- _Round 2:_ …
- _Round 3:_ …
