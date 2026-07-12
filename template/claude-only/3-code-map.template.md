# Code Map — <Project Name>

> **What this is:** the AI's running inventory of the methods it has created — what each one does in a single line, and which other files and methods it uses. The AI writes this; people just read it.
>
> **Why it exists:** before writing any new code, the AI checks this map for a method that already does the job (or nearly does) and **reuses it instead of rebuilding it** — that's the DRY house rule and the token-saving rule in one place. It's also how a developer new to the project sees, at a glance, what exists and what depends on what.
>
> **Where it's saved:** `claude-only/Code_map.md` — one file for the whole project, with one section per solution. `/build` updates it in the **Report back** step every time it creates, renames, or removes a method, and reads it in the **Plan** step.
>
> **Keeping it honest:** one row per method, one line per description. If a method changes so the row is wrong, the same build that changed it fixes the row. Rows are never left stale — an out-of-date map is worse than none.

---

## Solution — <Solution Name, e.g. ClothingWebsite>

**Repo:** <repository URL or "this repo"> · **Local path:** <where it's checked out>

| Method | File | What it does (one line) | Uses (files → methods) |
|--------|------|-------------------------|------------------------|
| <...>  | <...> | <...>                  | <...>                  |

> **Uses column:** list what the method calls — other methods in this codebase (with their file), endpoints from an API solution, or models from a database solution. Write "nothing" if it stands alone. Example rows:
>
> | Method | File | What it does (one line) | Uses (files → methods) |
> |--------|------|-------------------------|------------------------|
> | loginUser | ClothingWebsite/src/pages/UserLogin.tsx | Submits the login form and stores the returned JWT | src/lib/apiClient.ts → post; ClothingAPI → POST /users/login |
> | post | ClothingWebsite/src/lib/apiClient.ts | Sends a JSON POST to ClothingAPI and returns the parsed response | nothing |

---

## Solution — <Solution Name, e.g. ClothingAPI>

**Repo:** <repository URL or "this repo"> · **Local path:** <where it's checked out>

| Method | File | What it does (one line) | Uses (files → methods) |
|--------|------|-------------------------|------------------------|
| <...>  | <...> | <...>                  | <...>                  |
