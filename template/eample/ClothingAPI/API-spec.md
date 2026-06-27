# Endpoint — <Short Name (e.g. "Get customer orders")>

> **Who fills this in:** Developers.
>
> **When:** for each endpoint a page needs. One of these per endpoint. Copy it into the same **solution folder** as the page it serves (e.g. `backend/userLogin-get.md`) and link it from that page.
>
> **How:** answer in plain English where you can. Then hand it to Claude using the bridge in [`claude-only/1-translate-to-claude.md`](../claude-only/1-translate-to-claude.md) along with the page and any data models it touches.
> ** solution** definintion the folder this file is sitting in is the solution it is part of
---

## Where this lives

What is the purpose of this API?
To act as the sole api for all requests from the clothing website.

Where will this be hosted?
Azure function app

What is the type of authentication this will use?
JWT

**8. Define the technology you want to use?**
What language will this use?
Go

Does this use Claims or Roles to authenticate?
Roles

What frameworks Should we use?

How do we log errors and issues?
Azure application insigts.

Are API in Version specific folders 
No

What is the main url path 
/API/

**Status codes**

 Code, Meaning 

 200,Success

how is this documentnted for external users to review online?

---


---

## Notes

- **Which data models does it read or write?** <...>
- **Any limits** (rate limits, page size, max payload)? <...>
- **Anything to watch out for** (slow queries, side effects, things that must not happen twice)? <...>
