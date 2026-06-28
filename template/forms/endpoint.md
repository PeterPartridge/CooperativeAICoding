# Endpoint(s) — <Resource name, e.g. "User maintenance">

> **Who fills this in:** Developers.
>
> **When:** for each resource (a group of related operations) an API needs. One file per resource. Lives in the API's solution folder; the API itself is defined in that folder's [`API-spec.md`](API-spec.md).
>
> **How:** answer in plain English. Then hand it to Claude using the bridge in [`claude-only/1-translate-to-claude.md`](../claude-only/1-translate-to-claude.md), along with the page and any data models it touches.
>
> **Solution = the folder this file sits in.**

---

## What it does

**In one line, what is this resource for?**
> e.g. "Create, log in, and manage users."

_Your answer:_

**Overall base path**
> e.g. `/users`

_Your answer:_

---

## Operations

> One row per operation. "Who can call" uses the roles/claims from the Project Brief.

| Method | Name | Path | Auth required? | Who can call (roles/claims) |
|--------|------|------|----------------|------------------------------|
| POST | LoginUser | /login | No | Everyone |
| <...> | <...> | <...> | <...> | <...> |

---

## Request

**What does each operation expect in the body?**
> Show the shape per operation. Mark which fields are required.

_Your answer:_

---

## Response

**What does each operation return?**
> Describe the shape, and which data model(s) it comes from (the model files in the Database solution).

_Your answer:_

**Status codes**

| Code | Meaning |
|------|---------|
| 200 | Success |
| <...> | <...> |

---

## Notes

- **Which data models does it read or write?** <...>
- **Any limits** (rate limits, page size, max payload)? <...>
- **Anything to watch out for** (side effects, things that must not happen twice)? <...>
