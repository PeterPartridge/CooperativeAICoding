# Endpoint — <Short Name (e.g. "Get customer orders")>

> **Who fills this in:** Developers.
>
> **When:** for each endpoint a page needs. One of these per endpoint. Copy it into the same **solution folder** as the page it serves (e.g. `backend/userLogin-get.md`) and link it from that page.
>
> **How:** answer in plain English where you can. Then hand it to Claude using the bridge in [`claude-only/1-translate-to-claude.md`](../claude-only/1-translate-to-claude.md) along with the page and any data models it touches.

---

## What it does

**In one line, what is this endpoint for?**
user maintenance 

OverALL user path
/users

**Method, name, paths**
POST, LoginUser,  /login
POST, Logoutuser, /Logout
POST ResetPassword /resetPassword
POST CreateUser, / 
PATCH Updateuser, /
---

## Who can call it

**End points authentication required and what roles/claims can call it** 
LoginUser, no, everyone 
Logoutuser, Yes, All claims 
CreateUser, Admin
Updateuser, Admin


---

## Request

**Body of requests?**
LoginUser
{
    username:"", 
    Password:""
}

---

## Response

Response bodys 

---

## Notes

- **Which data models does it read or write?** <...>
- **Any limits** (rate limits, page size, max payload)? <...>
- **Anything to watch out for** (slow queries, side effects, things that must not happen twice)? <...>
