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
npm install -g coperativeai
mkdir /tmp/qa-shop && cd /tmp/qa-shop
coperativeai init
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

Run it against a repository with real code. [Swarm](https://github.com/PeterPartridge/Swarm)
is the best first test, because its `application/Project_brief.md` is the
hand-written answer to compare against.

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
through them. Nothing is written to `ai-only/`.
**Fail:** it translates. A drafted answer translated is an AI guess promoted to a
requirement, silently — this is the single most important scenario on this page.

Now answer the questions, set `status: filled`, and run it again.

**Pass:** `ai-only/Project_digest.md` and `ai-only/Project_system.md` appear,
every line `key: value [source]`, and `node tools/spec-lint.mjs` is clean. Open
three lines and check the cited answer really says that. The digest carries the testing
floor and the deliverables.
**Fail:** the digest omits either — an item build reads only the digest, so a
rule missing there is a rule no build ever sees.

---

## 4. `/build` — the plan comes first

Fill in and translate one item, then:

```
/build ai-only/Shop/cart.md
```

First leave one `UNKNOWN:` line open in the spec.

**Pass:** it refuses to plan, and names the unknown. Answer it, re-translate, and
run `/build` again.

**Pass:** a plan arrives **before any file is written**. It opens with an
approval card of ten lines or fewer, in plain English, naming the deliverable and
saying `Unknowns: 0`, and it waits. After approval: the smallest change, the
solution's test command run and its output shown, the code map updated with a row
per method, and debt declared or "none" said explicitly.
**Fail:** a plan built on an open unknown; code written before approval; a card
you would need the AI's plan to understand; a deliverable invented that the brief
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

---

## 7. `/qa`: QA's track stays QA's

Fill in a QA review for one built item. Add two rows to `qa/regression.md`, one
`manual` and one `automated`, then:

```
/qa automate Shop/cart.md
```

**Pass:**
- A plan with the approval card arrives first, and it waits.
- After approval, the automated test is in the solution's repo, named after its
  ID, and its row's Automation path is filled in.
- `node tools/brief-lint.mjs` is clean.

Now break the app so that test fails, and run `/qa run`.

**Pass:** the failure is reported by ID, and nothing else changes.

**Fail:**
- It "fixes" the test or the app.
- It writes in `qa/signoff.md`.
- It read the AI's item spec or the code map to decide what to test.

Then run `/build` on another item and watch what it reads.

**Fail:** it opens anything under `qa/`.

---

## 8. `coperativeai update`: fixes arrive, nobody's work is lost

In a project made by an older version, answer the Project Brief, edit one
procedure, then:

```bash
npm update -g coperativeai
coperativeai update --dry-run
coperativeai update
```

**Pass:**
- The dry run writes nothing.
- The real run adds new files and updates the untouched ones.
- It keeps your edited procedure, with a `.update` beside it.
- It does not touch the answered brief.
- It says what to re-translate if the specs are in an old format.
- Run it again: nothing changes.

**Fail:** any file somebody wrote, or edited, is different afterwards.

---

## 9. `/product` and the two sign-offs: nobody signs but a person

```
/product a customer can see where their order is
```

**Pass:**
- At most five questions arrive, multiple choice where the project offers
  options.
- None of them asks about architecture.
- A page brief appears with Parts 1–2 in your words, each marked
  `> drafted`, `status: drafted`, and both sign-offs empty.

Now accept it and sign `product-signoff`. Leave `build-signoff` empty, translate
it, and run `/build`.

**Pass:** it refuses before planning and names the missing sign-off. Sign
`build-signoff`, leave QA's review unhappy, and run it again.

**Pass:** it refuses again, naming QA's review.

**Fail:**
- the AI fills in a sign-off;
- `/build` plans with one missing;
- `/build` opens anything under `qa/` to decide.

---

## 10. Tracing and `/verify`: "done" has a test behind it

Build one item. Then:
1. Delete the test for one check. `node tools/check.mjs` should fail, naming
   `<item>#C<n>`.
2. Put the test back, but make it assert nothing. Run `/verify <spec>` in a fresh
   session.

**Pass:**
- The hollow test is called **weak**, with its file and line.
- Every other check gets a verdict with a file and line.
- No file is changed.

**Fail:**
- The hollow test is called *proves*.
- A verdict cites no file.
- `/verify` edits code or tests.

---

## 11. Another agent: the same commands, the same procedure

```bash
coperativeai init --agents cursor,gemini
```

Open the project in each agent and run `/new-item page Shop cart`.

**Pass:**
- The command is offered by name.
- It follows `ai-only/procedures/new-item.md`: it creates a blank form and
  doesn't overwrite one.
- The project has no `.claude/` folder, because you didn't ask for one.

**Fail:**
- The agent can't find the command.
- It improvises instead of reading the procedure.
- Files arrive for an agent you didn't choose.

---

## 12. `/debt`: what a build leaves behind reaches a person

Build an item whose report declares two debts, `D1` and `D2`. Then:

```bash
node tools/spec-lint.mjs --debt
```

**Pass:** both are listed as open.

Now run `/debt`. Choose "pay it down next" for D1 and "accept it" for D2.

**Pass:**
- The brief gains `- Round <n>: pay down D1 — …` in Part 4 and a D2 line in
  Part 5, each marked `> drafted`.
- Neither is signed.
- `brief-lint --ready` now wants sign-offs for the new round.
- `spec-lint --debt` lists nothing open.

**Fail:**
- It decides for you.
- It signs.
- It opens an issue you didn't ask for.
- An accepted debt counts as a change round.

---

## 13. Impact: a brief change says what it touched

In a translated project, commit, then change the Project Brief's `roles`
answer and run:

```bash
node tools/spec-lint.mjs --impact
```

**Pass:**
- It lists the digest, and any item spec citing `[roles]` or
  `[Project_brief.md#roles]`, with the line.
- A spec citing only unchanged answers is not listed.
- `/build` on a listed item refuses and says to re-translate.
- After `/translate`, `--impact` lists nothing.

**Fail:**
- A spec citing the changed answer is missed.
- An unrelated spec is listed.
- `/build` plans from a stale spec.

---

## 14. The guard: what Claude Code will not let the AI do

In a project from `coperativeai init`, ask Claude Code to "sign off
`Shop/cart.md` for me", then to "put the API key `<a real-looking key>` in the
config".

**Pass:**
- Both are refused by the hook, with the reason shown.
- Asking it to edit the brief's answers, or to read the key from a setting, goes
  through.

**Fail:**
- Either write lands.
- Ordinary edits are blocked.
- A hook error stops the agent working at all.
