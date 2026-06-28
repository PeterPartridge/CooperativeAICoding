# Translate Your Brief Into Something Claude Can Build From

> **Why this step exists.** People write best in plain, flowing language. AI models like **Claude Opus** and **Claude Sonnet** follow instructions most reliably when those same facts are laid out in a clear, labelled structure — a "system spec." This step is the bridge: you paste your plain brief into Claude, and Claude rewrites it into that structure **and works out the skills it will need.** You stay in plain English; Claude does the translating.
>
> You do **not** need to understand the structure yourself. You just check that the result matches what you meant.

---

## What you'll get back

When you run the translation, Claude produces three things (the Project Brief gets all three; a Page Brief gets the spec and skills):

1. **A System Spec** — your brief, reorganised into clear labelled sections (who it's for, the rules, the constraints, the design). This is what the AI re-reads every time it builds. The blank shape of it lives in **[`2-claude-system.template.md`](2-claude-system.template.md)** so the output always looks the same.

2. **A Project Digest** — a short (~12-line) constraints block extracted from the spec. Page translations reuse *this* instead of the whole project spec, so you don't re-send the full document for every page. Only produced at the project level.

3. **A Skills List** — the AI's own answer to *"what do I need to be good at to build this?"*

### What a "skill" means here (in plain words)

A **skill** is a capability the AI needs in order to do the job well — like "building login screens," "working with a payments service," or "making pages usable on a phone." Naming them up front does three useful things:

- **You can sanity-check it.** If the AI lists a skill you didn't expect (e.g. "handling credit-card data"), that's your cue to ask why — maybe it misunderstood, or maybe you forgot something important.
- **It scopes the work.** A short skills list means a simple job; a long one is a warning that the page or project may be too big and should be broken down.
- **It picks the right tools.** Each skill points the AI at the right approach, library, or reference instead of guessing.

The AI defines skills at **two levels**: skills for the **whole project** (filled in from the Project Brief) and skills for **each page** (filled in from that page's Page Brief). Page skills should build on the project ones, not repeat them.

---

## How to run it

1. Open Claude (Opus or Sonnet).
2. Copy **one** of the prompts below.
3. Paste your filled-in brief where it says `<<< PASTE … >>>`.
4. Send it. Claude returns the System Spec and Skills List.
5. Read it back. If anything's wrong, tell Claude in plain English ("the admin shouldn't be able to delete orders") and it will redo that part.
6. Save the result inside `claude-only/`, **mirroring the human folder layout**:
   - the Project Brief → `claude-only/Project_system.md`
   - a page like `ClothingWebsite/userLogin.md` → `claude-only/ClothingWebsite/userLogin.md`
   - a resource like `ClothingAPI/Login.md` → `claude-only/ClothingAPI/Login.md`

   So for every solution folder on the human side, Claude creates a matching solution folder on its side, with one spec file per item.

---

### Prompt A — Translate the Project Brief

```text
You are setting up a software project using the "CooperativeAICoding" framework.

Below is a Project Brief written in plain English by Product and Developers.
Your job is to translate it — do NOT invent features, scope, or technology that
isn't in the brief. If something important is missing, list it under "Open
Questions" instead of guessing.

Produce THREE sections:

1. SYSTEM SPEC — reorganise the brief into these labelled headings:
   - Purpose (one line)
   - Users (who, and what each wants)
   - Platforms & technology constraints
   - Coding house rules (with the project-specific meaning of each)
   - Access & security (who can do what, how people log in)
   - Look & feel / design references
   - Model & effort selection (which AI model — cheapest / mid-range / most capable — and how much reasoning effort, matched to task difficulty)
   - Open Questions (anything missing or unclear)

2. PROJECT DIGEST — a compact, self-contained extract that page translations
   reuse instead of re-reading the whole spec. Keep it under ~12 lines, just the
   constraints that bind every page: platform/tech, the house rules (names only),
   security model, roles, and the model/effort tiers. This is the ONLY part a
   page translation needs to see from the project level.

3. PROJECT SKILLS — the capabilities you'll need to build this project well.
   Present as a table: Skill | Why it's needed | How you'll use it | Tools/approach.
   Keep it to the skills the brief actually justifies. If the list grows long,
   note that the project may need breaking into smaller parts.

Follow these ground rules and restate them at the end under "Working Agreement":
- Build the smallest thing that satisfies each request; no unrequested extras.
- Treat existing code as working in production; avoid breaking it.
- If you can't finish something, record it as technical debt rather than retrying endlessly.
- A person reviews and approves before anything goes live.

Here is the brief:
<<< PASTE THE FILLED-IN PROJECT BRIEF HERE >>>
```

---

### Prompt B — Translate a Page Brief

```text
You are working on a software project that already has a Project System Spec.
Now translate the Page Brief (pasted below) for one page, using the
"CooperativeAICoding" framework.

To stay token-efficient, you do NOT need the full project spec — only its
Project Digest (the short constraints block). Provide it ONE of these ways:
  - If you can read files, open `claude-only/Project_system.md` and use its
    Project Digest section. Do not paste it.
  - Otherwise, paste just the Project Digest block where shown below.
Only ask for more of the project spec if a page decision genuinely needs detail
the digest doesn't cover.

Do NOT invent anything not in the briefs. Stay inside the project's constraints,
house rules, and security. If something important is missing, list it under
"Open Questions."

Produce TWO sections:

1. PAGE SPEC — reorganise the page brief into these labelled headings:
   - Page objective (the one unchanging purpose)
   - Model & effort (default model and effort level for this page, from the project's tiers)
   - Actions (what each kind of user can do)
   - Information shown / collected
   - Data to store (each item and what it looks like)
   - Access & security (who may use this page)
   - Tests (plain checks that prove it works)
   - Open Questions

2. PAGE SKILLS — the capabilities needed for THIS page specifically.
   Table: Skill | Why it's needed | How you'll use it | Tools/approach.
   Build on the project skills; don't repeat them. Note any skill this page needs
   that the project spec didn't already account for.

End with a short PLAN: a one-paragraph summary plus bullet points of the changes
you'd make, and an honest note of anything you expect to leave as technical debt.
Wait for a person to approve the plan before building.

Here is the project digest (or say "read from Project_system.md"):
<<< PASTE THE PROJECT DIGEST BLOCK HERE >>>

Here is the page brief:
<<< PASTE THE FILLED-IN PAGE BRIEF HERE >>>
```

---

## After translation

- The **System Spec** becomes the AI's standing instructions — keep it saved and up to date.
- The **Skills List** is your early-warning system: if it looks too big or has surprises, simplify the brief before building.
- When you change a brief later, re-run the matching prompt so the spec and skills stay in sync.
