# Screenshots

Three images, and the landing page renders the section **only once they exist** —
a page arguing that the AI declares its own debt, sitting above three broken
image icons, argues the opposite. Drop a file in with the exact name below and
the next build picks it up; delete it and the section goes away again.

Take them from the real app with real data. A mocked screenshot of a tool whose
entire pitch is "it does not claim what it cannot prove" is the one lie that
would cost the most.

| File | What it has to show |
|---|---|
| `debt-on-the-board.png` | The planning board with **work items the AI filed itself** after a build — debt it declared, and a question it could not answer. The point a reader must get in two seconds: this is the AI's own account of what it cut, sitting in the same place as everybody else's work. If the items are visibly AI-created (a badge, an author, a colour), frame that. |
| `plan-approval.png` | A build **plan waiting for approval** — the summary, the bullet-point changes, and the button that has not been pressed. It must be obvious that nothing has been written yet. |
| `sandbox-verdicts.png` | The **where agents run** table, with at least one *enforced* verdict and one *asked for*, so the difference the app refuses to blur is visible in one glance. A row that says "no boundary, because your distribution mounts C:" is worth more than three green ticks. |

## Practical

- **PNG, roughly 1400–1800px wide.** They are shown at up to ~560px in a
  three-column grid and full width on a phone, so that is enough for a retina
  screen without a megabyte per image.
- **Crop to the panel**, not the whole desktop. No taskbar, no other windows.
- **Light or dark, but the same one for all three** — the page carries no theme
  switch for them, and a mixed set reads as three different products.
- **Nothing private.** Real data, but not real customer names, repository URLs
  you would not publish, or anything from a `.env`. An API key visible in a
  screenshot is a rotated key.
- Keep each under about 400 KB if you can. The whole page is otherwise a few
  kilobytes of HTML, and this is the one thing that can make it slow.

The captions live in `SHOTS` in [`../build.mjs`](../build.mjs), next to the
filenames, so a shot that changes what it shows gets its caption changed in the
same edit.
