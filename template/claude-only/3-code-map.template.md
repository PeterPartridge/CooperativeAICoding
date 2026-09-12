# Code Map — <Project Name>

> **What this is:** the AI's running inventory of the methods it has created — what each one does in a single line, and which other files and methods it uses. The AI writes this; people just read it.
>
> **Why it exists:** before writing any new code, the AI checks this map for a method that already does the job (or nearly does) and **reuses it instead of rebuilding it** — that's the DRY house rule and the token-saving rule in one place. It's also how a developer new to the project sees, at a glance, what exists and what depends on what.
>
> **Where it's saved:** `claude-only/Code_map.md` — one file for the whole project, with one section per solution. `/build` updates it in the **Report back** step every time it creates, renames, or removes a method, and reads it in the **Plan** step.
>
> **Keeping it honest:** if a method changes so the row is wrong, the same build that changed it fixes the row. Rows are never left stale — an out-of-date map is worse than none. If the project adopts an existing codebase, the map starts empty and grows as builds touch existing methods — add a row for any existing method a build calls or changes, so the map converges on the code that actually matters.
>
> **One row per method, describing the code as it is now.** A later round *edits* the row it already has; it never adds a second one underneath. Two rows for one method is how a map starts describing the project's history instead of its code — and history belongs in the brief's round records, where somebody is actually looking for it.
>
> **The first sentence is the one-line summary.** It says what the method does, and nothing else: that first sentence is all a reuse scan reads before deciding whether to keep going, so it is the part that has to stay cheap. **Everything after it may be as long as the decision deserves** — why it is this way, what was tried, what would break if it were changed back. That is not padding; it is what stops the next build undoing a decision nobody wrote down. The two registers just have to stay in that order.

---

## Checking it

The map is the one document whose value dies the moment it stops being true, so it is checked rather than trusted:

```bash
node tools/code-map-lint.mjs
```

It reads every `claude-only/Code_map.md` and reports, with a `file:line` for each:

| Checked | Why it fails the build |
|---|---|
| Every file in the **File** column exists | A row pointing at a moved file sends the next build looking in the wrong place. |
| Every backticked name appears in one of that row's files | A renamed or deleted method still listed is a reuse invitation into nothing. |
| The **first sentence** is at most 200 characters | The one-line summary is what makes the map cheaper to read than the code. |

Two rows naming the same method in the same file, and an empty **Uses**, come back as warnings rather than errors.

**What it cannot check is whether the sentence is true.** It establishes that a name exists in a file, not that the line describing it is still accurate — that stays a person's job, and a passing run should not be read as more than it is.

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
