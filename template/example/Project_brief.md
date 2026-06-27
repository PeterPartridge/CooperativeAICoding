# Project Brief — Clothing Store

> **Example** — a filled-in copy of [`../Project_brief.md`](../Project_brief.md). It names three solutions, each with its own folder and spec: `ClothingWebsite`, `ClothingAPI`, `ClothingDatabase`.

---

## Part 1 — The Idea *(Product answers this)*

**1. In one or two sentences, what is the purpose of this software?**
An online clothing store where customers can browse, buy clothes, and manage their account.

**2. What problem does it solve, and for whom?**
Customers can't easily shop our range online today; this gives them a simple storefront.

**3. Who will use this software?**

- Customers — they want to: browse and buy clothes, and manage their login.
- Admins — they want to: manage users and products.

**4. Are there any apps or websites you like?**
Clean retail sites with large imagery (e.g. ASOS, Uniqlo).

**5. Are there any apps or websites you want to avoid copying?**
Cluttered marketplaces with heavy ads.

---

## Part 2 — How Should We Build the Solution(s) *(Developers answer this)*

> Each solution's specific technology lives in its own spec file. The answers here are the overall direction.

**6. What platforms would this development need to run on?**
A website (desktop + mobile browsers).

**7. Is this a single repo or multi purpose repo?**
Multi — separate solutions for the website, API, and database.

**8. Software development rules for the codebase.**
DRY — if code is repeated three times, move it to a shared library. Front-end page names use CamelCase.

**9. List the roles or claims used across the application.**
Admin, Manager, Customer.

**10. What technology will host these solutions?**
Azure (Static Web Apps, Function App, SQL).

**11. What database technology will the solution(s) use?**
SQL Server.

---

## Part 3 — Look & Feel *(Product answers this)*

**12. Do you have any designs, sketches, screenshots, or examples?**
Clean and friendly, lots of white space, large product imagery.

---

## Part 4 — When to Use Each AI Model *(Product + Developers)*

**13. When should we use the cheapest, fastest model?**
Simple, repetitive, or low-risk tasks.

**14. When should we use the mid-range model?**
Building medium and advanced complexity features.

**15. When should we use the most capable (and most expensive) model?**
Complex, ambiguous, or high-stakes bugs and features.

**16. How hard should the model think (effort level) for different kinds of work?**

- **Low effort:** simple, well-defined tasks.
- **Medium effort:** everyday building and changes.
- **High effort:** tricky logic, architecture decisions, or anything risky.

---

## Part 5 — Anything Else

**17. Is there anything important we haven't asked about?**
The website must never talk to the database directly — all data goes through ClothingAPI.

---

### The promises this project makes

- The AI builds the **smallest thing** that answers the request — no surprise extras.
- We treat anything already built as **working in production**, and avoid breaking it.
- If the AI can't finish something, it **says so and writes it down** instead of endlessly retrying.
- Every change is **reviewed by a person** before it goes live.
