---
description: Verify a build against its spec — a second opinion, best from a fresh session or another model. Each check gets a verdict (proves, weak, missing, failing) with a file and line. Reports; never fixes.
argument-hint: [path to the built item's spec, e.g. example/ai-only/ClothingWebsite/userLogin.md]
---

Follow **`ai-only/procedures/verify.md`** exactly, for: $ARGUMENTS

Resolve it under the project root you are working in — in this repository that is
`template/ai-only/procedures/verify.md`. The procedure is the instruction; this
file only passes the arguments to it, so that an agent which is not Claude Code
follows the same text rather than a copy that has drifted.
