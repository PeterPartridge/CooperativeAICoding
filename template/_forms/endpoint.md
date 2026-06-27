# Endpoint — <Short Name (e.g. "Get customer orders")>

> **Who fills this in:** Developers.
>
> **When:** for each endpoint a page needs. One of these per endpoint. Copy it into the same **solution folder** as the page it serves (e.g. `backend/userLogin-get.md`) and link it from that page.
>
> **How:** answer in plain English where you can. Then hand it to Claude using the bridge in [`claude-only/1-translate-to-claude.md`](../claude-only/1-translate-to-claude.md) along with the page and any data models it touches.

---

## Where this lives

**Which solution / service does this endpoint belong to?**

_Your answer:_

**Which page(s) use it?**

_Your answer:_

---

## What it does

**In one line, what is this endpoint for?**
> e.g. "Return the list of orders for the logged-in customer."

_Your answer:_

**Method and path**
> e.g. `GET /customers/{id}/orders`

_Your answer:_

---

## Who can call it

**Does it require authentication?** _(yes / no)_

_Your answer:_

**Who is allowed to call it?**
> e.g. the logged-in customer (their own data only), admins, another service.

_Your answer:_

---

## Request

**What does the caller send?**
> Path parts, query options, and/or a body. Say which are required.

| Part | Where (path / query / body) | Type | Required? | Description |
|------|-----------------------------|------|-----------|-------------|
| <...> | <...>                      | <...> | <...>    | <...>       |

---

## Response

**What does a successful response return?**
> Describe the shape, and which [data model(s)](../_forms/database-model.md) it comes from.

_Your answer:_

**Status codes**

| Code | Meaning |
|------|---------|
| 200  | Success |
| <...> | <...>  |

**What can go wrong, and what does the caller get back?**
> e.g. "Not logged in → 401", "Order not found → 404".

- <...>

---

## Notes

- **Which data models does it read or write?** <...>
- **Any limits** (rate limits, page size, max payload)? <...>
- **Anything to watch out for** (slow queries, side effects, things that must not happen twice)? <...>
