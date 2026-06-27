# Project Brief — <Project Name>

> **Who fills this in:** the people who own the idea (Product) and the people who will build it (Developers), together.
>
> **How:** just answer the questions below in plain English. Write like you're explaining it to a new colleague — you don't need any technical wording. Leave a question blank if you genuinely don't know yet, but try.
>
> When you're done, this brief gets handed to Claude using the bridge in **[`claude-only/1-translate-to-claude.md`](claude-only/1-translate-to-claude.md)**, which turns your answers into instructions the AI can follow.
>
> **How the folders are laid out:** this project brief lives at the root. Each **solution** (e.g. `frontEnd`, `backend`) gets its own folder, and each **page** is a file inside it — e.g. `frontEnd/page1.md`, `backend/userLogin.md`. To create a page, copy [`_forms/page.md`](_forms/page.md) into the right solution folder. Endpoints and data models for that page go in the same solution folder (copies of [`_forms/endpoint.md`](_forms/endpoint.md) and [`_forms/database-model.md`](_forms/database-model.md)).

---

## Part 1 — The Idea *(Product answers this)*

**1. In one or two sentences, what is the purpose of this software?**
> Example: "An app that lets dog walkers book and get paid for walks."

_Your answer:_

**2. What problem does it solve, and for whom?**
> What problem are we solving?

_Your answer:_

**3. Who will use this software?**
> List the kinds of people. For each, say what they're trying to get done.

- Person/group: … — they want to: …
- Person/group: … — they want to: …

**4. Are there any apps or websites you like?**
> Links or names are fine.

_Your answer:_

**5. Are there any apps or websites you want to avoid copying?**
> Links or names are fine.

_Your answer:_

---

## Part 2 — How Should We Build the Solution(s) *(Developers answer this)*

**6. What platforms would this development need to run on?**
> e.g. a website, Android, iOS, Windows service, etc.

_Your answer:_

**7. Is this a single repo or multi purpose repo?**
> e.g. one combined codebase, or separate repos for each service/app.

_Your answer:_

**9. Software development rules for the codebase.**
> List rules for how the code will be written in general and add Software development practices to follow and how you define them and the AI must use this definition.
> e.g. Build this using DRY (Do not repeat yourself) — if you are repeating code three times, put that code into a shared library where it can be accessed.
> All Frontend code will use CamelCase for page names.

_Your answer:_

**10. Can you list roles or claims that will be used int he application?**
> e.g. Claims Admin, SuperAdmin, Manager, ?

_Your answer:_

**11. What technology will host this solution?**
> e.g. a particular hosting service, an app store, your own servers. "Not decided" is not a valid answer.

_Your answer:_

**11. Databse technology will this solution use?**
> e.g. a particular hosting service, an app store, your own servers. "Not decided" is not a valid answer.

_Your answer:_

---

## Part 3 — Look & Feel *(Product answers this)*

**12. Do you have any designs, sketches, screenshots, or examples?**
> Paste links, attach images, or just describe the feeling you want (e.g. "clean and friendly, lots of white space").

_Your answer:_

---

## Part 4 — When to Use Each AI Model *(Product + Developers)*

> AI models trade cost against capability. Cheaper, faster models are great for simple, well-defined work; more powerful, pricier models are worth it for complex or high-risk work. Tell the AI when to reach for each, so it doesn't overspend on easy tasks or under-power hard ones.

**13. When should we use the cheapest, fastest model?**
> simple, repetitive, or low-risk tasks.

_Your answer:_

**14. When should we use the mid-range model?**
> Building medium and advanced complexity tasks.

_Your answer:_

**15. When should we use the most capable (and most expensive) model?**
> Best for complex, ambiguous, or high-stakes bugs and features.

_Your answer:_

**16. How hard should the model think (effort level) for different kinds of work?**
> Separate from *which* model, you can dial how much effort it spends reasoning before it acts. Higher effort = more careful, slower, more tokens; lower effort = faster and cheaper. Say when to use each.
> - **Low effort:** simple, well-defined tasks where the answer is obvious.
> - **Medium effort:** everyday building and changes.
> - **High effort:** tricky logic, architecture decisions, or anything risky.

_Your answer:_

---

## Part 5 — Anything Else

**17. Is there anything important we haven't asked about?**

_Your answer:_

---

### The promises this project makes (no need to edit — just so everyone's agreed)

- The AI builds the **smallest thing** that answers the request — no surprise extras.
- We treat anything already built as **working in production**, and avoid breaking it.
- If the AI can't finish something, it **says so and writes it down** instead of endlessly retrying.
- Every change is **reviewed by a person** before it goes live.
