# Database Model — <Model / Table Name>

> **Who fills this in:** Developers (Product can sanity-check the information being stored).
>
> **When:** whenever a page needs to store data. One of these per model/table. Copy it into the same **solution folder** as the page it belongs to and link it from that page.
>
> **How:** answer in plain English where you can. Then hand it to Claude using the bridge in [`claude-only/1-translate-to-claude.md`](../claude-only/1-translate-to-claude.md) along with the page it serves.
> ** solution definintion the folder this file is sitting in is the solution it is part of
> ** table or object name defined by the file name

---

## What this model is

**What does this model represent, in one line?**
User Credentials
---

## Fields

Field name, Type, Nullable, Default, Rules / constraints,Description 
id,key,No, auto generated, unique, The unique identifier 
Username, VarChar(Max), No, None, unique, None
password, VarChar(Max), No, None, unique, None 

---

## Relationships

> How this model connects to others. Leave blank if it stands alone.

Feild, realtionShip type, Table, Feild, constraint name

---

## Lookups & performance

**Which fields do we search or filter on a lot?**
> These usually need an index so the page stays fast.

- ID
-username

---

## Lifecycle & rules

- **How long do we keep this data / when is it deleted?** <...>
- **Any sensitive fields** (personal data, payment info) that need extra protection? <...>
- **Anything that must always be true** (e.g. "an order must belong to a customer")? <...>
