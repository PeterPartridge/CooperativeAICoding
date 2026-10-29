---
spec: page
from: ClothingWebsite/userLogin.md
deliverable: MVP
depends-on: [ClothingAPI/Login.json]
---
objective: so a customer can log in to their account [why-exists]
model: cheapest model, low effort [model-and-effort]
action: customer enters username and password and logs in [actions]
action: customer starts a password reset [actions]
look: like the rest of the site — clean, white space, a centred login card [look]
info: username, password [information]
store: nothing on the website; ClothingAPI checks credentials against UserCredentials [data-stored]
must: the typed password is never saved — not to disk, browser storage, logs or URLs [in-memory]
access: everyone — logged-out visitors [who-can-use]
check: C1 correct username and password logs the customer in [tests]
check: C2 wrong password shows an error and does not log in [tests]
check: C3 "forgot password" starts a reset [tests]
limit: never log or store the password in plain text [limits]
uses: ClothingAPI POST /users/login [ClothingAPI/Login.json#operations]
skill: login form handling — the page collects credentials [information]
UNKNOWN: how does a logged-out customer start a reset? ResetPassword needs a login [actions, ClothingAPI/Login.json#operations]
UNKNOWN: what does "starts a reset" give the customer — an email, a link, a form? [tests]
UNKNOWN: where does a successful login take the customer? The account page MVP needs has no brief [actions, Project_brief.md#deliverables]
