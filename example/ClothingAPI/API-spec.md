# API Solution Spec — ClothingAPI

> **Example** — a filled-in copy of [`_forms/API-spec.md`](../../_forms/API-spec.md). The solution is the folder this file sits in (`ClothingAPI`).

---

## The API

**What is the purpose of this API?**
The single API for all requests from the clothing website.

**Where will it be hosted?**
Azure Function App.

**What language will it use?**
Go.

**What frameworks should it use?**
_(none specified yet)_

---

## Authentication

**What type of authentication does it use?**
JWT.

**Does it authorise callers by Claims or Roles?**
Roles.

---

## Conventions

**What is the main URL path?**
`/api/`

**Are endpoints organised into version-specific folders?**
No.

**How do we log errors and issues?**
Azure Application Insights.

**How is the API documented for external users online?**
_(to be decided)_

---

## Standard responses

| Status code | Meaning |
|-------------|---------|
| 200 | Success |

---

## Notes

- **Anything this solution must NOT do / cannot deploy?** <...>
- **Any limits** (rate limits, payload size)? <...>
