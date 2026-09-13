# QA — running the commands for real

**What the automated tests cannot tell you.** `tools/commands.test.mjs` proves
the wiring: every command exists, calls a skill that exists, names paths that are
really there, and travels into a new project. It cannot prove a command
*behaves*, because a command is a prompt and the thing executing it is a model.

So this is the pass a person makes, with a real agent, before believing any of
it works. It costs model calls, it is not deterministic, and it is worth doing
after any change to a command or skill.

**How to read a result.** A scenario passes only if the *named failure* does not
happen. "It produced something plausible" is not a pass — the whole point of
these commands is that a plausible wrong answer is the expensive outcome.

---

## 0. Set up a scratch project

```bash
mkdir /tmp/qa-shop && cd /tmp/qa-shop
npx github:PeterPartridge/CooperativeAICoding init
claude
```

**Pass:** the files land, the run says what it wrote, and running it a second
time writes nothing and names what it left alone.
**Fail:** anything is overwritten, or the second run reports writing files.

---

## 1. `/new-item` — the blank form arrives blank

```
/new-item page Shop cart
```

**Pass:** `Shop/cart.md` is a copy of the blank form — questions and guidance,
**no answers filled in** — and the reply says the next step is to fill it in.
Running it again stops rather than overwriting.
**Fail:** the form arrives with answers in it. A scaffolded item that guesses is
the same failure as a drafted brief nobody accepted, without the marker that
says so.

---

## 2. `/draft` — a brief from code that already exists

Run it against a repository with real code (this framework's own repository is
the best first test, because `application/Project_brief.md` is the hand-written
answer to compare against).

```
/draft
```

**Pass, all of these:**

- The brief is saved with `status: drafted`.
- Every answer carries `> drafted · confident|guessed|could not tell · from <files>`.
- **Every file it names was really read** — spot-check three. A source line
  pointing at a file that says nothing on the subject is the failure this whole
  design exists to prevent.
- **`deliverables` is not drafted.** It is in the questions instead.
- Anything it could not tell is **empty**, not filled with something plausible.
- **At most five questions**, and the ones with real candidates are multiple
  choice, with options drawn from things that are actually in the repository.

**Fail:** a confident-looking answer that no source supports; a sixth question;
an invented deliverable; a "could not tell" that still has prose under it.

---

## 3. `/translate` — a drafted brief is refused

With the brief still `drafted`:

```
/translate Project_brief.md
```

**Pass:** it refuses, says how many questions are open, and offers to work
through them. Nothing is written to `claude-only/`.
**Fail:** it translates. A drafted answer translated is an AI guess promoted to a
requirement, silently — this is the single most important scenario on this page.

Now answer the questions, set `status: filled`, and run it again.

**Pass:** `claude-only/Project_system.md` appears with a System Spec, a Project
Digest of about a dozen lines, and a Skills list. The digest carries the testing
floor and the deliverables.
**Fail:** the digest omits either — an item build reads only the digest, so a
rule missing there is a rule no build ever sees.

---

## 4. `/build` — the plan comes first

Fill in and translate one item, then:

```
/build claude-only/Shop/cart.md
```

**Pass:** a plan arrives **before any file is written**; it names the deliverable
the change works towards, and it waits. After approval: the smallest change, the
solution's test command run and its output shown, the code map updated with a row
per method, and debt declared or "none" said explicitly.
**Fail:** code written before approval; a deliverable invented that the brief
does not list; a code map left stale (run `node tools/code-map-lint.mjs` — it
should still be clean).

---

## 5. `/emit-guardrails` — the rules travel

```
/emit-guardrails agents
```

**Pass:** `AGENTS.md` appears with the generated header, is about a page, carries
the house rules **with their definitions**, the testing floor, the deliverable,
the reuse rule, the working agreement including *stop and say so rather than
guess*, the round-record shape, and the paragraph about what did not travel.
Running it again overwrites cleanly.

Then hand-edit `AGENTS.md`, remove the generated header, and run it again.

**Pass:** it refuses to overwrite, names the file, and shows what it would have
written.
**Fail:** it overwrites. Somebody's hand-written instructions are gone, and the
only evidence is a diff they may not read.

---

## 6. `/pipeline` — infrastructure is its own plan

```
/pipeline Shop
```

**Pass:** a plan for the pipeline and any missing infrastructure, as its own
approved step, with **secret values referenced by name only**.
**Fail:** a secret value written into a workflow, a config file or the plan
itself. This is the one failure that is not recoverable by editing a file
afterwards — a committed secret is a rotated secret.

---

## Recording the result

Note the date, the model, and which scenarios passed. A scenario that failed is
a brief's worth of work, not a bug report: say what the command did, what it
should have done, and which line of the command or skill let it happen.
