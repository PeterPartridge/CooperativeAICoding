# Endpoints — User maintenance

> **Example** — a filled-in copy of [`_forms/endpoint.md`](../../_forms/endpoint.md). Lives in the `ClothingAPI` solution; the API itself is defined in [`API-spec.md`](API-spec.md).

---

## What it does

**In one line, what is this resource for?**
Create, log in, and manage users.

**Overall base path**
`/users`

---

## Operations

| Method | Name | Path | Auth required? | Who can call (roles/claims) |
|--------|------|------|----------------|------------------------------|
| POST  | LoginUser     | /login          | No  | Everyone |
| POST  | LogoutUser    | /logout         | Yes | All roles |
| POST  | ResetPassword | /resetPassword  | Yes | All roles |
| POST  | CreateUser    | /               | Yes | Admin |
| PATCH | UpdateUser    | /               | Yes | Admin |

---

## Request

**What does each operation expect in the body?**

`LoginUser`:
```json
{
  "username": "",
  "password": ""
}
```

_(other operations: to be defined)_

---

## Response

**What does each operation return?**
_(response bodies: to be defined — reads/writes the `UserCredentials` model in the ClothingDatabase solution)_

**Status codes**

| Code | Meaning |
|------|---------|
| 200 | Success |

---

## Notes

- **Which data models does it read or write?** `UserCredentials` (ClothingDatabase).
- **Any limits** (rate limits, page size, max payload)? <...>
- **Anything to watch out for** (side effects, things that must not happen twice)? <...>
