---
form: page-brief
page: userLogin
solution: ClothingWebsite
depends-on: [ClothingAPI/Login.json]
status: filled
---

# Page Brief — userLogin

> **Example** — a filled-in copy of [`_forms/page.md`](../../template/_forms/page.md), in the `ClothingWebsite` solution, with the guidance lines removed.

---

## Part 1 — What This Page Is For *(Product answers — set once)*

### why-exists — Why does this page exist?
So a customer can log in to their account.

---

## Part 2 — What It Should Do *(Product answers — can change each round)*

### actions — What should someone be able to do on this page?
- Someone (who: a customer) can: enter their username and password and log in.
- Someone (who: a customer) can: start a password reset.

### look — What should it look like?
Like the rest of the site — clean, white space, a centred login card.

### information — What information does this page show or collect?
- Username
- Password

### who-can-use — Who is allowed to use this page?
Everyone (logged-out visitors).

---

## Part 3 — Building Details *(Developers answer)*

> Calls the `ClothingAPI` user-maintenance endpoints — see [`../ClothingAPI/Login.json`](../ClothingAPI/Login.json). The website itself stores no data.

### data-stored — What information needs to be stored, and what does each bit look like?
None on the website — credentials are verified by ClothingAPI against the `UserCredentials` model.

### in-memory — Does anything need to be remembered while the page is open (not saved permanently)?
The typed username/password until the login request is sent.

### tests — How will we know it works? What should we test?
- Correct username + password logs the customer in.
- Wrong password shows an error and does not log in.
- "Forgot password" starts a reset.

### limits — Any known limits or things to watch out for?
Never log or store the password in plain text.

### model-and-effort — Which AI model and effort level should this page use by default?
Cheapest model, low effort — it's a simple, well-defined page.

---

## Part 4 — changes-over-time

- Round 2: …
