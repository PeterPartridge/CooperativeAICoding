# Page Brief — userLogin

> **Example** — a filled-in copy of [`_forms/page.md`](../../_forms/page.md), in the `ClothingWebsite` solution.

---

## Part 1 — What This Page Is For *(Product answers — set once)*

**1. Why does this page exist?**
So a customer can log in to their account.

---

## Part 2 — What It Should Do *(Product answers — can change each round)*

**2. What should someone be able to do on this page?**

- Someone (who: a customer) can: enter their username and password and log in.
- Someone (who: a customer) can: start a password reset.

**3. What should it look like?**
Like the rest of the site — clean, white space, a centred login card.

**4. What information does this page show or collect?**

- Username
- Password

**5. Who is allowed to use this page?**
Everyone (logged-out visitors).

---

## Part 3 — Building Details *(Developers answer)*

> Calls the `ClothingAPI` user-maintenance endpoints — see [`../ClothingAPI/Login.md`](../ClothingAPI/Login.md). The website itself stores no data.

**6. What information needs to be stored, and what does each bit look like?**
None on the website — credentials are verified by ClothingAPI against the `UserCredentials` model.

**7. Does anything need to be remembered while the page is open (not saved permanently)?**
The typed username/password until the login request is sent.

**8. How will we know it works? What should we test?**

- [ ] Correct username + password logs the customer in.
- [ ] Wrong password shows an error and does not log in.
- [ ] "Forgot password" starts a reset.

**9. Any known limits or things to watch out for?**
Never log or store the password in plain text.

**10. Which AI model and effort level should this page use by default?**
Cheapest model, low effort — it's a simple, well-defined page.

---

## Part 4 — Changes Over Time

> Each time you come back to improve the page, add a short note here describing **what you want to change**. Keep changes small.

- _Round 2:_ …
- _Round 3:_ …
