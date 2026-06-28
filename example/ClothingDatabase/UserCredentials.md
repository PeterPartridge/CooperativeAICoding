# Database Model — UserCredentials

> **Example** — a filled-in copy of [`_forms/database-model.md`](../../_forms/database-model.md). Solution = `ClothingDatabase`; table name = this file's name (`UserCredentials`). The engine (SQL Server) is set in [`Database-spec.md`](Database-spec.md).

---

## What this model is

**What does this model represent, in one line?**
A user's login credentials.

---

## Fields

| Field name | Type | Nullable? | Default | Rules / constraints | Description |
|------------|------|-----------|---------|---------------------|-------------|
| id       | key          | No | auto-generated | unique | The unique identifier |
| username | VarChar(Max) | No | none           | unique | The login name |
| password | VarChar(Max) | No | none           | hashed | The hashed password |

---

## Relationships

> How this model connects to others. Leave blank if it stands alone.

_(stands alone for now)_

---

## Lookups & performance

**Which fields do we search or filter on a lot?**

- id
- username

---

## Lifecycle & rules

- **How long do we keep this data / when is it deleted?** Kept while the account is active; deleted when the account is closed.
- **Any sensitive fields** (personal data, payment info) that need extra protection? `password` — must always be stored hashed, never in plain text.
- **Anything that must always be true?** `username` must be unique.
