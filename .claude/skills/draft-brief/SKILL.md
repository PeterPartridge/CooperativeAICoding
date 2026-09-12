---
name: draft-brief
description: Fill in a CooperativeAICoding Project Brief (or an item brief) from an existing codebase — drafting every answer the code can actually evidence, marking each with where it came from and how sure it is, and ending with a short multiple-choice list of the few things the code cannot tell anybody. Use when someone points at an existing project and wants the framework started without facing a blank form.
---

# Draft a brief from an existing codebase

**The blank form is why people stop.** Twenty-odd questions before anything
happens is a fair price for a new project and an unreasonable one for a codebase
that already exists and already answers most of them. This skill reads the code
and writes the draft; a person then corrects it, which takes minutes instead of
an evening.

**What it does not change.** A drafted answer is the AI's, and it is marked as
the AI's. The brief is saved with `status: drafted`, `/translate` refuses it in
that state, and it becomes the project's brief only when a person has been
through it and set `status: filled`. The AI may propose the words. Only a
person's acceptance makes them binding.

---

## 1. Read for intent, not for inventory

Read in this order, and stop when the picture is clear rather than reading
everything:

| Order | Source | Why it is where it is |
|---|---|---|
| 1 | `README`, `docs/`, `CONTRIBUTING` | Somebody already wrote down what this is for. Start with the one source whose whole job is intent. |
| 2 | Tests | A test is a sentence about what was meant to be true. Test *names* are often the clearest statement of purpose in a repository. |
| 3 | Recent commit messages (last ~3 months) | What this project keeps trying to do — direction, which no single file shows. |
| 4 | The public surface: routes, endpoint names, CLI commands, database schema, exported types | What it lets people do, stated in the project's own vocabulary. |
| 5 | Manifests and CI config | Platforms, hosting, environments, test commands — the technical answers, cheaply. |
| 6 | The implementation | **Last, and least.** Code tells you mechanism. A brief drafted from it describes how the thing is built and misses what it is for, which is the one thing the brief is for. |

Record which files you actually read. It goes in the brief, so a person can see
the basis for an answer — and see where you had nothing to go on.

**Budget.** Read the map before the territory: README, manifests, folder names,
route table, schema. Sample deeper only where the picture is thin. Drafting a
brief should cost minutes, not a full repository read.

---

## 2. Draft only what the code can evidence

Every drafted answer is written as the answer itself, followed by one line:

```
### purpose — In one or two sentences, what is the purpose of this software?
A desktop workspace where a team plans product work, builds it with AI agents, and designs the tests around it.
> drafted · confident · from README.md, src/pages/{ProductPlanning,DevelopSolutions,TestArea}.tsx
```

The confidence word is one of:

- **confident** — more than one source says it, and they agree.
- **guessed** — one weak source, or an inference across sources. Say so; a
  guessed answer a person corrects in five seconds is useful, and a guessed
  answer wearing a confident face is a defect.
- **could not tell** — **leave the answer empty**. Write the marker line and
  nothing else. A plausible sentence invented to avoid an empty field is the
  single worst thing this skill can produce, because it reads exactly like an
  answer somebody gave.

**Never draft, under any circumstances:**

- **`deliverables`** — what the team is working towards *next* cannot be read
  out of code that already exists, and a wrong guess here corrupts the one field
  that decides when a build stops. It goes in the question list, always.
- **`apps-to-avoid`**, and anything about **who the users are** that no source
  states. Inferring users from a schema produces confident fiction.
- Anything about **cost, model choice or effort tiers**. Those are a team's
  policy, not a property of the code.

---

## 3. End with the questions — few, and answerable in one keystroke

**People do not fill in long forms, and they do not read long question lists
either.** So the interview at the end of the drafted brief obeys three rules:

1. **At most five questions.** Rank by what blocks the most work: `deliverables`
   first (nothing can stop at a stopping point without it), then anything a
   build would have to guess at — security model, environments, the testing
   floor. Whatever does not make the cut is left blank in the brief with its
   `could not tell` marker, where it can be answered later or never.
2. **Multiple choice wherever the code offers real options.** Options are
   *drawn from evidence*, never invented — half-finished routes, feature flags,
   skipped tests, a TODO that names a feature, an env var with no consumer. Two
   to four options, each one line, plus a final "something else" that takes a
   sentence. A person picking `b` has answered; a person facing a blank text box
   has a task.
3. **Free text only when choice would be fake.** If the code genuinely offers no
   candidates, ask the open question — but say what you looked at, so the person
   knows you tried.

Write them at the end of the brief like this, and ask the same questions in
conversation so they can be answered by letter:

```markdown
---

## Before this can be translated — 3 questions

**1. What are we working towards first?** *(I cannot read this out of the code —
it is the one answer that decides when a build stops and waits for you.)*
- **a)** Finish checkout — `src/checkout/` has routes and no tests, and three
  commits in the last month touch it.
- **b)** The admin area — `src/admin/` is scaffolded and unreachable from the nav.
- **c)** Stabilise what exists — 14 tests are skipped.
- **d)** Something else (tell me in a sentence).

**2. Who is allowed to use the admin pages?** *(`requireRole("admin")` appears in
four files, and nothing defines what admin means.)*
- **a)** Staff only, by role.
- **b)** Anyone logged in.
- **c)** Something else.

**3. What has to be true before a change counts as tested?** *(`vitest` is
configured; no threshold is set anywhere.)*
- **a)** 90% line cover on new and changed code.
- **b)** Every branch and guard has a test; no percentage.
- **c)** Something else.
```

---

## 4. Save it as the AI's work

- Write to `<projectRoot>/Project_brief.md`, front matter `status: drafted`.
- **Never overwrite a brief that is `filled` or `approved`.** Stop and say so.
  If one exists and is `drafted`, replacing it is fine — that is a re-draft.
- Below the front matter, one line naming what this was drafted from and when:
  `> Drafted from the codebase on <date>. Every answer below is the AI's until you
  accept it: read it, fix what is wrong, answer the questions at the end, then set
  status: filled.`
- Then say, in conversation: how many answers are confident, how many guessed,
  how many it could not tell, and the questions — by letter.

## 5. Items, only when asked

`/draft item <path>` drafts **one** page, endpoint or model brief, by the same
rules. Never draft every item in a repository: two hundred drafted briefs nobody
reads is worse than none, and it buries the handful that matter.
