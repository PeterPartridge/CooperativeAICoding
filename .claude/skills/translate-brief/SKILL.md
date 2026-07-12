---
name: translate-brief
description: Translate a filled-in CooperativeAICoding brief (Markdown Project_brief.md or page brief, or a JSON endpoint/database-model/solution-spec form) into a structured Claude System Spec, a reusable Project Digest, and a Skills List, then save it under template/claude-only/ mirroring the human folder layout. Use whenever the user hands over or points at a filled-in CooperativeAICoding form and wants it turned into instructions Claude can build from.
---

# Translate a CooperativeAICoding brief

This skill automates the bridge that previously required pasting Prompt A / Prompt B
by hand from [`template/claude-only/1-translate-to-claude.md`](../../../template/claude-only/1-translate-to-claude.md).
It turns a plain-English brief into the structured spec the AI builds from, while
staying token-efficient (no re-sending the whole project spec for every page).

## When to use

Trigger when the user provides, or points at, a filled-in form from this framework.
Forms come in two shapes; both carry a `form` key (which kind it is) and a `status`
key (`blank | filled | approved`):
- **Markdown briefs** (project brief, page briefs) — YAML frontmatter + one `###
  <id> — <question>` heading per question. Under a heading, lines starting with `>`
  are form guidance/examples; everything else is the person's answer. Never treat
  guidance as an answer.
- **JSON forms** (endpoint, database-model, and the three solution specs) — question
  objects with `question` / `guidance` / `example` fields plus the person's
  plain-English `answer` (or `entries` lists). Same rule: only `answer`/`entries`
  content is the person's input.

Routing:
- A **Project Brief** (`template/Project_brief.md` or a copy, `form: project-brief`) → run the *project* translation.
- A **Page / endpoint / database-model brief** (e.g. `ClothingWebsite/userLogin.md`, `ClothingAPI/Login.json`) → run the *page* translation.

If you can't tell which, ask once. Don't translate a blank master form from
`template/_forms/` (`status: blank`, or all answers empty).

## Hard rules (do not break these)

- **Do not invent** features, scope, technology, or security that isn't in the brief. Gaps go under **Open Questions**, never guesses.
- **Stay inside** the project's platform, house rules, roles, and security.
- Restate the **Working Agreement** at the end (smallest change, treat existing code as production, log technical debt instead of retrying endlessly, a person approves before building, score each change by token cost).

## Procedure

### A. Translating a Project Brief

1. Read the brief. Read [`template/claude-only/2-claude-system.template.md`](../../../template/claude-only/2-claude-system.template.md) for the exact output shape.
2. Produce, in this order:
   - **System Spec** — the labelled headings from the template (Purpose, Users, Platforms & tech constraints, Coding house rules, Access & security, Look & feel, Model & effort selection, Open Questions).
   - **Project Digest** — a compact ≤12-line constraints block (platform/tech, house-rule names, security model, roles, model/effort tiers). This is the only project-level context a page translation will need.
   - **Project Skills** — table: `Skill | Why it's needed | How you'll use it | Tools/approach`. Keep it to what the brief justifies; if it grows long, flag that the project may need splitting.
3. Save to `template/claude-only/Project_system.md`.

### B. Translating a Page / endpoint / database-model brief

1. **Get project constraints cheaply.** Read `template/claude-only/Project_system.md` and use *only* its **Project Digest** section. Do not load the whole spec unless a specific page decision needs detail the digest doesn't cover. If `Project_system.md` doesn't exist yet, translate the Project Brief first (procedure A).
2. Read the page brief.
3. Produce:
   - **Page Spec** — Page objective, Model & effort, Actions, Information shown/collected, Data to store, Access & security, Tests, Open Questions.
   - **Page Skills** — table building on the project skills (don't repeat them); flag any skill new for this page.
   - **PLAN** — one-paragraph summary + bullet changes + an honest note of expected technical debt.
4. Save to the mirrored path: `<solution>/<item>.md|.json` → `template/claude-only/<solution>/<item>.md` (e.g. `ClothingWebsite/userLogin.md` → `template/claude-only/ClothingWebsite/userLogin.md`, `ClothingAPI/Login.json` → `template/claude-only/ClothingAPI/Login.md`).

## After translating

- Show the result and **wait for the person to approve** before any building.
- If the skills list looks too big or has surprises, say so — that's the signal the brief is too large or was misunderstood.
- When a brief changes later, re-run this skill for that item so spec, digest, and skills stay in sync.
