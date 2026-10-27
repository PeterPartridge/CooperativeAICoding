# AI System Spec — Clothing Store

> Translated from [`../Project_brief.md`](../Project_brief.md) by `/translate`, using today's spec shape. This is the **baseline** for the Lean AI layer deliverable: it is kept as written so the token cost of the current format can be compared with the lean one.

---

## Project System Spec

**Purpose**

An online clothing store where customers can browse, buy clothes, and manage their account.

**Users**

| User | What they want to do |
|------|----------------------|
| Customers | Browse and buy clothes, and manage their login. |
| Admins | Manage users and products. |

**Deliverables** _(in order — the first is what everything is building towards)_
> Each is a stopping point: when the last item naming it is built, the work stops there to be looked at.

| # | Deliverable | Done when |
|---|-------------|-----------|
| 1 | MVP | A customer can register, log in, and see their account. |
| 2 | Storefront | A customer can browse the range and view one item. |
| 3 | Checkout | A customer can pay and get a receipt. |

**Platforms & technology constraints**

A website for desktop and mobile browsers. Multi-repository: the website, API and database are separate solutions. The website never talks to the database directly — all data goes through ClothingAPI.

**Solutions & repositories**

| Solution | Type | Repository | Local path |
|----------|------|------------|------------|
| ClothingWebsite | website | github.com/example/clothing-website | ../clothing-website |
| ClothingAPI | API | github.com/example/clothing-api | ../clothing-api |
| ClothingDatabase | database | github.com/example/clothing-database | ../clothing-database |

**Infrastructure & environments**

Hosted on Azure (Static Web Apps, Function App, SQL). The AI writes Bicep in each solution's `infra/` folder and the pipeline deploys it; the Key Vault and the SQL elastic pool are managed by a person. Environments: dev (the AI may deploy) and production (people deploy after review). Secrets live in Azure Key Vault and GitHub Actions secrets and are referenced by name only.

**Coding house rules**

| Rule | What it means on this project |
|------|-------------------------------|
| DRY | If code is repeated three times, move it to a shared library. |
| CamelCase page names | Front-end page names use CamelCase. |

**Testing floor**

New and changed code needs 90% line cover across the API and the website. Anything that decides something — a permission check, a price calculation, an order-status change — has a test named after the decision it makes. Not tested: generated clients, plain data holders, framework glue. A change that cannot reach 90% says so in its debt note rather than lowering the number.

**Access & security**

Roles: Admin, Manager, Customer. Database: SQL Server. Per-solution authentication and baselines are set in each solution's `application-spec.json`.

**Look & feel / design references**

Clean and friendly, lots of white space, large product imagery. Liked: clean retail sites with large imagery (e.g. ASOS, Uniqlo). Avoid: cluttered marketplaces with heavy ads.

**Model & effort selection**

| Model tier | Example | When to use it |
|------------|---------|----------------|
| Cheapest / fastest | e.g. Claude Haiku | Simple, repetitive, or low-risk tasks. |
| Mid-range | e.g. Claude Sonnet | Building medium and advanced complexity features. |
| Most capable | e.g. Claude Opus | Complex, ambiguous, or high-stakes bugs and features. |

| Effort level | When to use it |
|--------------|----------------|
| Low | Simple, well-defined tasks. |
| Medium | Everyday building and changes. |
| High | Tricky logic, architecture decisions, or anything risky. |

**Open questions**

- **How does a customer register?** MVP is done when "a customer can register", but the only operation that creates a user (`CreateUser` in ClothingAPI) is Admin-only, and no item covers registration.
- **What does "see their account" show?** MVP needs it, and no item covers it yet.
- **What can a Manager do?** The role is listed, and no item or rule uses it.
- **How does a logged-out customer reset a password?** The login page lets logged-out visitors start a reset, but `ResetPassword` requires authentication.

---

## Project Digest *(reused by page translations)*

- **Platform / tech:** website (desktop + mobile browsers); TypeScript + React website, Go API on Azure Functions, SQL Server database; the website never talks to the database directly.
- **Solutions & repos:** ClothingWebsite → github.com/example/clothing-website, ../clothing-website; ClothingAPI → github.com/example/clothing-api, ../clothing-api; ClothingDatabase → github.com/example/clothing-database, ../clothing-database.
- **Infra & environments:** AI writes Bicep in each solution's infra/, pipeline deploys; Key Vault and elastic pool are person-managed; dev (AI may deploy), production (people deploy after review); secrets in Azure Key Vault + GitHub Actions secrets, by name only.
- **House rules:** DRY (three repeats → shared library); CamelCase page names.
- **Testing floor:** 90% line cover on new/changed code; every decision has a test named after it; skip generated clients, data holders, framework glue; shortfall goes in the debt note.
- **Deliverables:** MVP → Storefront → Checkout.
- **Security model:** JWT from ClothingAPI; roles gate access; per-solution security baselines.
- **Roles:** Admin, Manager, Customer.
- **Model & effort tiers:** cheapest/low for simple work; mid-range/medium for everyday building; most capable/high for complex, ambiguous or risky work.

---

## Project Skills *(defined by the AI)*

| Skill | Why it's needed | How the AI will use it | Tools / approach |
|-------|-----------------|------------------------|------------------|
| React + TypeScript front end | ClothingWebsite is a React site | Build pages, components, client-side auth handling | react-vite boilerplate, Vitest + React Testing Library |
| Go HTTP APIs on Azure Functions | ClothingAPI is Go on a Function App | Handlers per resource, JWT validation, role checks | go-azure-functions boilerplate, table-driven tests |
| SQL Server schema design | ClothingDatabase holds every model | One table per database-model brief, constraints, indexes | sql-server-database-project boilerplate, tSQLt |
| Authentication and role-based access | JWT login and three roles | Deny-by-default role checks, hashed passwords | api-baseline and website-baseline rules |
| Azure infrastructure as code | The AI writes Bicep | Static Web App, Function App, SQL database, wired to Key Vault by name | Bicep, GitHub Actions |

---

## Working Agreement

- Build the **smallest change** that satisfies the request — no unrequested extras.
- Treat existing code as **working in production**; avoid breaking it.
- Record **technical debt** instead of retrying endlessly.
- A **person reviews and approves** every plan before anything is built.
- **Score each change** by how token-intensive it's likely to be.
- **Never put secret values in code, config, or logs** — reference them by name from their stores.
- **Infrastructure and pipelines are their own approved plans** — never a side effect of building a feature.
