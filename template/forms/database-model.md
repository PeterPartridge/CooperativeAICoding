# Database Model — <Model / Table Name>

> **Who fills this in:** Developers (Product can sanity-check the information being stored).
>
> **When:** whenever a page needs to store data. One of these per model/table. Copy it into the same **solution folder** as the page it belongs to and link it from that page.
>
> **How:** answer in plain English where you can. Then hand it to Claude using the bridge in [`claude-only/1-translate-to-claude.md`](../claude-only/1-translate-to-claude.md) along with the page it serves.
>
> **Solution = the folder this file sits in. Table / object name = this file's name.** The database engine is set once for the whole solution in [`Database-spec.md`](Database-spec.md).

---

## What this model is

**What does this model represent, in one line?**
> e.g. "A customer's order."

_Your answer:_

---

## Fields

> One row per piece of data. "Type" can be plain (text, number, date, true/false, money, list) — Developers can map it to the real database type.

| Field name | Type | Nullable? | Default | Rules / constraints | Description |
|------------|------|-----------|---------|---------------------|-------------|
| id         | id / key | No     | auto    | unique              | The unique identifier |
| <...>      | <...> | <...>    | <...>   | <...>               | <...>       |

---

## Relationships

> How this model connects to others. Leave blank if it stands alone.

| Field | Relationship | Related table | Related field | Constraint name |
|-------|--------------|---------------|---------------|-----------------|
| <...> | one-to-many / many-to-one / many-to-many | <...> | <...> | <...> |

---

## Lookups & performance

**Which fields do we search or filter on a lot?**
> These usually need an index so the page stays fast.

- <...>

---

## Lifecycle & rules

- **How long do we keep this data / when is it deleted?** <...>
- **Any sensitive fields** (personal data, payment info) that need extra protection? <...>
- **Anything that must always be true** (e.g. "an order must belong to a customer")? <...>
