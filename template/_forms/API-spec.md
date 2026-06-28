# API Solution Spec — <Solution / Folder Name>

> **Who fills this in:** Developers.
>
> **When:** once per API solution. This file sits at the root of the API's solution folder and defines how the whole API is built. Each endpoint/resource is a separate file in the same folder (copies of [`endpoint.md`](endpoint.md)).
>
> **How:** answer in plain English. Then hand it to Claude using the bridge in [`claude-only/1-translate-to-claude.md`](../claude-only/1-translate-to-claude.md).
>
> **Solution = the folder this file sits in.**

---

## The API

**What is the purpose of this API?**
> e.g. "The single API for all requests from the clothing website."

_Your answer:_

**Where will it be hosted?**
> e.g. Azure Function App, AWS Lambda, a container.

_Your answer:_

**What language will it use?**
> e.g. Go, C#, TypeScript.

_Your answer:_

**What frameworks should it use?**

_Your answer:_

---

## Authentication

**What type of authentication does it use?**
> e.g. JWT, API keys, OAuth.

_Your answer:_

**Does it authorise callers by Claims or Roles?**
> The roles/claims vocabulary itself is listed in the Project Brief.

_Your answer:_

---

## Conventions

**What is the main URL path?**
> e.g. `/api/`

_Your answer:_

**Are endpoints organised into version-specific folders?**
> e.g. `/api/v1/…` — yes / no.

_Your answer:_

**How do we log errors and issues?**
> e.g. Azure Application Insights.

_Your answer:_

**How is the API documented for external users online?**
> e.g. OpenAPI / Swagger.

_Your answer:_

---

## Standard responses

| Status code | Meaning |
|-------------|---------|
| 200 | Success |
| <...> | <...> |

---

## Notes

- **Anything this solution must NOT do / cannot deploy?** <...>
- **Any limits** (rate limits, payload size)? <...>
