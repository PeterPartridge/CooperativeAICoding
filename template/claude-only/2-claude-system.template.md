# Claude System Spec — <Project Name>

> **What this is:** the structured version of your brief that the AI re-reads every time it builds. You don't write this from scratch — Claude produces it from your plain brief using [`1-translate-to-claude.md`](1-translate-to-claude.md). This file just shows the shape it should come back in, so every project looks the same.
>
> **Where it's saved:** Claude mirrors the human folder layout. The project-level spec is saved as `Project_system.md` here in `claude-only/`; each page spec is saved at `claude-only/<solution>/<page>.md` to match the human `<solution>/<page>.md`.
>
> Read it back against your brief to make sure nothing was changed or invented.

---

## Project System Spec

**Purpose**
> One line.

<...>

**Users**

| User | What they want to do |
|------|----------------------|
| <...> | <...> |

**Platforms & technology constraints**

<...>

**Coding house rules**

| Rule | What it means on this project |
|------|-------------------------------|
| <...> | <...> |

**Access & security**

<...>

**Look & feel / design references**

<...>

**Model & effort selection**
> When to use each AI model, and how hard it should think, so the AI matches both model cost and reasoning effort to the difficulty of the task.

| Model tier | Example | When to use it |
|------------|---------|----------------|
| Cheapest / fastest | Claude Haiku | <...> |
| Mid-range | Claude Sonnet | <...> |
| Most capable | Claude Opus | <...> |

| Effort level | When to use it |
|--------------|----------------|
| Low | <...> |
| Medium | <...> |
| High | <...> |

**Open questions**
> Anything missing from the brief that a person needs to answer.

- <...>

---

## Project Digest *(reused by page translations)*

> A compact, self-contained extract of the constraints that bind every page. Page translations read **this** instead of the whole spec, so the full project document isn't re-sent per page. Keep it under ~12 lines.

- **Platform / tech:** <...>
- **House rules:** <names only, e.g. DRY, CamelCase page names>
- **Security model:** <how users log in, how endpoints are protected>
- **Roles:** <...>
- **Model & effort tiers:** <cheapest → … ; low/med/high effort → …>

---

## Project Skills *(defined by the AI)*

> The capabilities the AI needs for the project as a whole. A short list means a tidy scope; a long one is a signal to break the project down.

| Skill | Why it's needed | How the AI will use it | Tools / approach |
|-------|-----------------|------------------------|------------------|
| <...> | <...>           | <...>                  | <...>            |

---

## Per-Page Specs

> One block per page, produced from each Page Brief. Page skills build on the project skills above — they don't repeat them.

### Page — <Page Name>

**Objective** _(unchanging)_

<...>

**Model & effort** _(default for this page; override per change)_
> e.g. "Claude Sonnet, medium effort."

<...>

**Actions**

| User | Can do |
|------|--------|
| <...> | <...> |

**Information shown / collected**

- <...>

**Data to store**

| Item | What it looks like |
|------|--------------------|
| <...> | <...> |

**Access & security**

<...>

**Tests**

- [ ] <...>

**Open questions**

- <...>

#### Page Skills *(defined by the AI)*

| Skill | Why it's needed | How the AI will use it | New for this page? |
|-------|-----------------|------------------------|--------------------|
| <...> | <...>           | <...>                  | <...>              |

---

## Working Agreement *(the AI restates these and sticks to them)*

- Build the **smallest change** that satisfies the request — no unrequested extras.
- Treat existing code as **working in production**; avoid breaking it.
- Record **technical debt** instead of retrying endlessly.
- A **person reviews and approves** every plan before anything is built.
- **Score each change** by how token-intensive it's likely to be.
