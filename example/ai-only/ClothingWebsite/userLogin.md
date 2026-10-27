# Page Spec — userLogin

> Translated from [`../../ClothingWebsite/userLogin.md`](../../ClothingWebsite/userLogin.md) by `/translate`, reading only the Project Digest. **Baseline** for the Lean AI layer deliverable, in today's spec shape.

---

**Objective** _(unchanging)_

So a customer can log in to their account.

**Model & effort** _(default for this page; override per change)_

Cheapest model, low effort — a simple, well-defined page.

**Deliverable** _(which one this item works towards)_

MVP — listed in the Project Brief.

**Depends on** _(briefs that must be `built` before this one)_

- ClothingAPI/Login.json

**Actions**

| User | Can do |
|------|--------|
| Customer | Enter their username and password and log in. |
| Customer | Start a password reset. |

**Information shown / collected**

- Username
- Password

**Data to store**

| Item | What it looks like |
|------|--------------------|
| — | Nothing on the website. Credentials are verified by ClothingAPI against the UserCredentials model. |

The typed password is never saved — not to disk, browser storage, logs, or URLs.

**Access & security**

Everyone (logged-out visitors). Never log or store the password in plain text.

**Tests**

- [ ] Correct username + password logs the customer in.
- [ ] Wrong password shows an error and does not log in.
- [ ] "Forgot password" starts a reset.

**Open questions**

- **How does a logged-out customer start a reset?** This page offers it to logged-out visitors, but `ResetPassword` in ClothingAPI requires authentication ("All roles").
- **What does "starts a reset" mean for the customer?** An email, a link, or a form? Nothing says what they see or receive.
- **Where does a successful login take the customer?** The account page that MVP needs has no brief yet.

#### Page Skills *(defined by the AI)*

| Skill | Why it's needed | How the AI will use it | New for this page? |
|-------|-----------------|------------------------|--------------------|
| Login form handling | The page collects credentials | Controlled form; the password stays in component state only | Yes |
| Calling ClothingAPI with JWT | Login returns a token | POST /users/login through the shared API client; keep the token out of URLs and logs | No — project auth skill |

---

## PLAN

Add a `UserLogin` page to ClothingWebsite: a centred login card that posts the username and password to ClothingAPI's `POST /users/login`, keeps the returned JWT client-side, and shows a generic error on failure. The page is not built until `ClothingAPI/Login.json` is built.

- **Login:** a form with username and password; on submit, call the API client; on success, store the token and leave the page.
- **Wrong password:** show one generic error, and never say which half was wrong.
- **Forgot password:** a link that starts the reset — **blocked** until the open question about unauthenticated reset is answered.
- **Tests:** one test per check above, plus the decisions the testing floor requires (the error path, and the password never reaching storage or logs).

**Expected debt:** the post-login destination and the reset flow stay open until Product answers the questions above.
