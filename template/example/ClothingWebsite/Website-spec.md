# Website Solution Spec — ClothingWebsite

> **Example** — a filled-in copy of [`_forms/Website-spec.md`](../../_forms/Website-spec.md). The solution is the folder this file sits in (`ClothingWebsite`).

---

## The website

**What is the purpose of this website / front-end?**
The storefront customers use to browse and buy clothes, and to manage their account.

**What language and framework will it use?**
TypeScript + React.

**Where will it be hosted?**
Azure Static Web Apps.

---

## Look & feel

**What is the overall look and feel?**
Clean and friendly, lots of white space, large product imagery.

**What styling approach or component library?**
Tailwind CSS.

---

## Behaviour

**Which API(s) does it talk to?**
ClothingAPI (`/api/`).

**How does it authenticate users?**
JWT returned by `ClothingAPI` `/users/login`, stored client-side. Admin-only pages are gated by the `Admin` role.

**How do we log front-end errors?**
Azure Application Insights.

---

## Notes

- **Anything this solution must NOT do?** It must not talk to the database directly — all data goes through ClothingAPI.
