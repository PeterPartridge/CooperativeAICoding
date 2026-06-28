---
description: Build the next iteration of an approved spec — smallest change first — then report back and log debt.
argument-hint: [path to an approved spec in template/claude-only/, e.g. template/claude-only/ClothingWebsite/userLogin.md]
---

Build from the approved spec at: $ARGUMENTS
If no path was given, ask which spec to build (or list specs under
`template/claude-only/`).

Honor the Working Agreement at all times:
- Make the **smallest change** that satisfies the spec / this iteration — no unrequested extras.
- Treat all existing code as **working in production**; do not break it. Assume it works even if it looks broken.
- Pick the **model & effort** the spec specifies for this item.
- If you cannot finish something, **stop and record it as technical debt** rather than retrying endlessly.

Workflow:
1. **Plan** — restate a one-paragraph summary plus bullet-point changes (one per use case). Wait for my approval before editing code.
2. **Execute** — only after I approve.
3. **Report back** — append to the spec what you did, how each use case was implemented, and the test scenarios you created.
4. **Declare debt** — list any technical debt created or anything you could not implement, and (if useful) score how token-intensive each change was.
