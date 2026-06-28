# CooperativeAICoding

A framework that gives **Product, Developers, and AI** a single, shared way of working — so that software is built to clear objectives, within agreed technical guardrails, without the AI wandering off and burning tokens rebuilding things that already work.

Development is a team game, and normally this would involve Product working with Developers and Quality Assurance to build a good product, with continuous feedback from Product to Developers, Developers to Product, and QA to Developers and Product — all about capabilities, general product functionality, and look and feel.

## The Problem

AI allows us to move faster, but this also means communication involves AI putting its own spin on the product, the coding, and how the QA is written. The plan of this framework is to make AI part of the team and stop AI from going its own way with a product.

AI when given vague or general descriptions tends to:

- get lost and add endpoints or features that weren't asked for,
- spend a lot of tokens creating, then recreating, the same work, and
- produce large-scale changes at high speed that overwhelm teams and destabilise production.

The goal is to give AI and all team members a source of truth for the product. Create **guardrails** around this so AI can build a solution that developers can maintain, following the Product flow, and also give AI a place to feed back what it cannot do. This also allows developers to keep to the idea of changing as little production code as possible and to use AI to create more testable code.

## How It Works

The framework is defined in three areas:
- The Project brief, which is the why we are doing this, plus general development rules and structure, and gives AI the software engineering practices to employ and how the developers it is working with define these ideas.
- The solution specification, which is where developers define the reason for each solution, give AI the solution-specific guidance, and set it up to successfully move quickly.
- The endpoint/page/database model, which allows us to define the purpose of what we are creating and what we need from the page, and is designed to build a page iteratively. AI can do the task and, instead of burning tokens trying to implement something it can't understand, it says "I can implement this" and allows the developers to tell it how to implement it, or go to Product and rethink the feature.

### Global Setup

Before any page is built, Product and Developers define the shared rules:

- **Objectives & customers (Product)** — what the software is for and who it serves.
- **Technology & formats (Developers)** — the tech stack, the platforms the solution must run on, and the formats it must support.
- **Coding standards** — general techniques the AI must follow (e.g. DRY, SOLID). Each standard must be defined: what it means here and how the AI should apply it.
- **Frameworks** — which global frameworks are in use and how they should be upgraded.
- **Security** — how users are authenticated, how endpoints are protected, and how permissions are enforced.
- **Design** — a place for Product to link UI/UX references, attach images or descriptions, and define their customers.

The aim of the technology rules is that any new endpoint the AI creates works with the target platform and is written so that build errors are less likely.

### Pages

Once the global setup is complete, the system is broken into **sub-sections**, and each sub-section is a **page**.

Each page is defined **once** by Product, then built up **iteratively** by Developers — starting from the simplest working version and growing toward the final system one iteration at a time (changing data models, adding behaviour, and so on).

#### Page Layout

**Product — fixed question (asked once):**
- *Why do we have this page?* — the overall objective of the page.

**Product — iterative questions:**
- How should the page look?
- What information do we want to record?
- What are the use cases? Who uses this page, and how do they use it under different conditions?
- Who should be able to use it? (This sets the security expectations for developers.)

**Developers — questions:**
- What should the data model look like?
- Do we need to hold any data in memory?
- What tests should we run?
- What endpoints should be used?

## The AI Workflow

For each page (and each iteration), the AI follows a defined loop:

1. **Plan** — the AI generates a plan from the questions above, with a summary at the top and bullet-point changes describing how each use case will be implemented.
2. **Review & execute** — the developer reviews and updates the plan, then executes it.
3. **Report back** — once complete, the AI updates the plan document with what it did, how each use case was implemented, and what test scenarios it created.
4. **Declare debt** — the AI lists any technical debt it created or anything it failed to implement.

> The AI should **not** spend ages trying to fix or reimagine something. It builds the page simply and clearly records where it fell short and what debt it introduced.

## Iterations

After the first build, each further iteration defines **what needs to change**:

- Change in use case?
- Change in tests?
- Change in UI/UX?
- Change in technology?
- Change in data model?
- Change in endpoints?
- How should existing technical debt or earlier AI failures be addressed?

**Guiding principles for changes:**

- The AI should change **only** what the change case requires, making the **smallest possible** change to avoid breaking production code.
- Assume all existing code is working in production — even if it looks broken.
- The AI should **score each change** by how token-intensive it is likely to be.

> This is not an exhaustive list. Product and Developers need space to define what else each page requires and how the AI should implement those changes.

## Templates

The working layout lives in [`template/`](template/). **You** fill in plain-English forms; **Claude** translates them into structured specs — working out the **skills** it needs — and mirrors your folders on its side.

- **[`template/Project_brief.md`](template/Project_brief.md)** — plain questions about the whole project. Filled in once.
- **[`template/_forms/`](template/_forms/)** — blank master forms to copy: [`page.md`](template/_forms/page.md), [`endpoint.md`](template/_forms/endpoint.md), [`database-model.md`](template/_forms/database-model.md).
- **`template/<solution>/`** — one folder per solution (e.g. `frontEnd/`, `backend/`); each page is a file inside it, like `frontEnd/page1.md` or `backend/userLogin.md`.
- **[`template/claude-only/`](template/claude-only/)** — Claude's side (no human input): the [translate bridge](template/claude-only/1-translate-to-claude.md) and the [spec shape](template/claude-only/2-claude-system.template.md). Claude mirrors your solution folders here, e.g. `frontEnd/page1.md` → `claude-only/frontEnd/page1.md`.

See [`template/README.md`](template/README.md) for the full layout and step-by-step flow.
