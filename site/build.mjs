// Builds the GitHub Pages site: a landing page, and the project's own
// documents published as docs.
//
// **The documents are the source, and they are not touched.** Every page under
// /docs is generated from a markdown file that already exists in this
// repository for its own reasons — the README, the how-to, and the page briefs
// the framework is actually run from. Nothing here asks those files to carry
// front matter or a nav entry for the website's benefit: a doc that has to be
// edited to be publishable is one that goes stale the first time somebody is in
// a hurry.
//
// **Links are rewritten rather than left to rot.** A brief links to other files
// in the repository, which on a website is a 404. Links to documents that are
// published here point at the published page; everything else points at the
// file on GitHub, where it really is.
import { marked } from "marked";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..");
const out = path.join(here, "dist");

const GITHUB = "https://github.com/PeterPartridge/CooperativeAICoding";
/** Where this is actually served. Pages puts it on a sub-path, which is why
 *  every link in the templates is relative — an absolute `/style.css` would
 *  resolve to the wrong origin and break every page. This constant exists only
 *  for the things that genuinely require an absolute URL: canonical links, the
 *  share cards, and the sitemap. */
const SITE = "https://peterpartridge.github.io/CooperativeAICoding";
/** GitHub redirects this to whatever the newest release is, so the site never
 *  names a version it will be wrong about an hour later. */
const LATEST = `${GITHUB}/releases/latest`;

/** What gets published, in the order it should be read. */
const DOCS = [
  { source: "README.md", slug: "index", title: "What this is" },
  { source: "HOW-TO-USE.md", slug: "how-to-use", title: "How to use it" },
  {
    source: path.posix.join("application", "Project_brief.md"),
    slug: "project-brief",
    title: "The app's own project brief",
  },
];

/** The page briefs — the framework being used on itself, which is the most
 *  useful documentation there is and the least likely to drift, since these are
 *  the files the work is actually done from. */
const BRIEFS_DIR = path.join("application", "CoperativeAI");

/** Reads a brief's front matter without a YAML parser.
 *
 *  Only two fields are wanted and both are plain scalars, so a parser would be
 *  a dependency bought to read `page: "Workspace Shell"`. Anything unexpected
 *  falls back to the first heading, which every one of these files has. */
function frontMatter(text) {
  if (!text.startsWith("---")) return { body: text, fields: {} };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { body: text, fields: {} };
  const fields = {};
  for (const line of text.slice(3, end).split("\n")) {
    const at = line.indexOf(":");
    if (at === -1) continue;
    const key = line.slice(0, at).trim();
    const value = line
      .slice(at + 1)
      .replace(/#.*$/, "")
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key) fields[key] = value;
  }
  const body = text.slice(text.indexOf("\n", end + 1) + 1);
  return { body, fields };
}

/** A document's title: what it calls itself, then its first heading, then its
 *  file name. Never empty — an untitled entry in a nav is unclickable in
 *  practice because nobody knows what it is. */
function titleOf(fields, body, fallback) {
  if (fields.page) return fields.page;
  const heading = body.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].replace(/^Page Brief\s+[—-]\s+/, "").trim();
  return fallback;
}

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The shell every page shares. */
function page({ title, body, nav, depth, description, canonical }) {
  const root = depth === 0 ? "." : "..";
  const url = `${SITE}${canonical}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<!-- **The one that actually earns its place.** Most of this page's readers will
     arrive from a link somebody pasted into a chat, and without these they are
     handed a bare URL to decide about. Search ranking is not the point — a
     project like this is found through its repository. -->
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="CooperativeAICoding">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(description)}">
<link rel="icon" href="${root}/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${root}/style.css">
</head>
<body>
<!-- **First thing in the tab order, and it is not decorative.** Every docs page
     puts a 21-item sidebar before the text; without this, reaching the prose by
     keyboard means twenty-one tab presses on every single page. -->
<a class="skip" href="#content">Skip to content</a>
<!-- Painted with CSS only and hidden from assistive technology: it carries no
     information, and announcing it would just be noise. -->
<div class="backdrop" aria-hidden="true"></div>
<header class="top">
  <a class="wordmark" href="${root}/index.html">
    <img class="mark" src="${root}/favicon.svg" alt="" width="28" height="28">CooperativeAICoding
  </a>
  <nav aria-label="Main">
    <a href="${root}/docs/index.html">Docs</a>
    <a href="${GITHUB}">
      <span class="gh" aria-hidden="true">&#9670;</span> Repository
    </a>
    <a class="cta" href="${LATEST}">Download</a>
  </nav>
</header>
<div class="page">
${nav ?? ""}
<main class="prose" id="content" tabindex="-1">
${body}
</main>
</div>
<footer>
  <div class="foot-in">
    <p>CooperativeAICoding is the framework. <strong>CoperativeAI</strong> is the
    desktop app built with it — the historical spelling is kept because the
    folders and solution names use it.</p>
    <p class="foot-links">
      <a href="${GITHUB}">Repository on GitHub</a>
      <a href="${LATEST}">Latest release</a>
      <a href="${GITHUB}/issues">Issues</a>
      <a href="${GITHUB}/blob/main/LICENSE">Licence</a>
    </p>
    <p class="small">Free and open source. Built with the framework it documents.</p>
  </div>
</footer>
</body>
</html>
`;
}

/** Rewrites a repository-relative link so it works from a published page. */
function fixLink(href, published, fromDir) {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  const clean = href.split("#")[0];
  const anchor = href.slice(clean.length);
  // Resolved against the document's own folder, which is what a relative link
  // in that document meant — resolving against the repository root would send
  // every link in a brief to the wrong place.
  const target = path.posix.normalize(
    path.posix.join(fromDir.split(path.sep).join("/"), clean),
  );
  const asDoc = published.get(target);
  if (asDoc) return `${asDoc}.html${anchor}`;
  return `${GITHUB}/blob/main/${target}${anchor}`;
}

async function main() {
  await fs.rm(out, { recursive: true, force: true });
  await fs.mkdir(path.join(out, "docs"), { recursive: true });

  const briefFiles = (await fs.readdir(path.join(repo, BRIEFS_DIR)))
    .filter((f) => f.endsWith(".md"))
    .sort();

  const all = [
    ...DOCS.map((d) => ({ ...d, from: "." })),
    ...briefFiles.map((f) => ({
      source: path.posix.join(BRIEFS_DIR.split(path.sep).join("/"), f),
      slug: f.replace(/\.md$/, "").replace(/\s+/g, "-").toLowerCase(),
      from: BRIEFS_DIR,
      brief: true,
    })),
  ];

  // Built first so links between documents can point at published pages.
  const published = new Map();
  for (const doc of all) {
    published.set(doc.source, `docs/${doc.slug}`);
  }

  const entries = [];
  for (const doc of all) {
    const raw = await fs.readFile(path.join(repo, doc.source), "utf8");
    const { body, fields } = frontMatter(raw);
    const title = doc.title ?? titleOf(fields, body, doc.slug);

    const renderer = new marked.Renderer();
    const base = renderer.link.bind(renderer);
    renderer.link = (token) => {
      const fromDir = doc.from === "." ? "." : doc.from;
      // Docs all live one folder deep, so a link to another doc is a sibling.
      let href = fixLink(token.href, published, fromDir);
      if (href.startsWith("docs/")) href = href.slice("docs/".length);
      return base({ ...token, href });
    };

    const html = marked.parse(body, { renderer, mangle: false, headerIds: true });
    entries.push({ ...doc, title, status: fields.status ?? "" });
    await fs.writeFile(
      path.join(out, "docs", `${doc.slug}.html`),
      page({
        title: `${title} — CooperativeAICoding`,
        description: `${title}, from the CooperativeAICoding framework.`,
        body: html,
        depth: 1,
        canonical: `/docs/${doc.slug}.html`,
        nav: sidebar(entries, doc.slug),
      }),
      "utf8",
    );
  }

  // Rewritten now that every title is known, so the sidebar is complete on
  // every page rather than only on the last one built.
  for (const doc of entries) {
    const file = path.join(out, "docs", `${doc.slug}.html`);
    const html = await fs.readFile(file, "utf8");
    await fs.writeFile(
      file,
      html.replace(/<aside class="side">[\s\S]*?<\/aside>/, sidebar(entries, doc.slug)),
      "utf8",
    );
  }

  await fs.writeFile(path.join(out, "index.html"), landing(entries), "utf8");

  // **A sitemap because the sidebar is the only route to most of these.** Half
  // the docs are reachable from one nav and nothing else, which is exactly the
  // shape a crawler gives up on. Dated from each document's own last change, so
  // "when did this last say something new" is answered by the file rather than
  // by when the site happened to be rebuilt.
  const urls = await Promise.all(
    entries.map(async (doc) => {
      const stat = await fs.stat(path.join(repo, doc.source));
      return `  <url>
    <loc>${SITE}/docs/${doc.slug}.html</loc>
    <lastmod>${stat.mtime.toISOString().slice(0, 10)}</lastmod>
  </url>`;
    }),
  );
  await fs.writeFile(
    path.join(out, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}/</loc>
    <priority>1.0</priority>
  </url>
${urls.join("\n")}
</urlset>
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(out, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`,
    "utf8",
  );
  await fs.copyFile(path.join(here, "style.css"), path.join(out, "style.css"));
  await fs.copyFile(path.join(here, "favicon.svg"), path.join(out, "favicon.svg"));
  // Tells GitHub Pages not to run the output through Jekyll, which would
  // otherwise drop anything beginning with an underscore without saying so.
  await fs.writeFile(path.join(out, ".nojekyll"), "", "utf8");
  console.log(`built ${entries.length + 1} pages into ${out}`);
}

function sidebar(entries, current) {
  const group = (label, of) => {
    const items = entries.filter(of);
    if (items.length === 0) return "";
    return `<p class="side-head">${label}</p><ul>${items
      .map(
        (e) =>
          `<li><a${e.slug === current ? ' class="here"' : ""} href="${e.slug}.html">${escape(
            e.title,
          )}</a></li>`,
      )
      .join("")}</ul>`;
  };
  return `<aside class="side">
${group("The framework", (e) => !e.brief)}
${group("Page briefs", (e) => e.brief)}
</aside>`;
}

/** The front door.
 *
 *  **Says what this is before it says anything else.** A landing page that
 *  opens with a feature list assumes somebody already knows what they are
 *  looking at, and most people arriving here will not. */
function landing(entries) {
  const body = `
<section class="hero">
  <h1>Product, Developers, QA and AI, working to one plan.</h1>
  <p class="lede">A desktop workspace where teams plan products, build them, and
  design the tests — cooperatively with AI, on their own machine. Nothing is
  allowed unless a policy says so, and nothing claims to be enforced unless it
  has been proved.</p>
  <p class="actions">
    <a class="cta big" href="${LATEST}">Download CoperativeAI</a>
    <a class="ghost big" href="docs/index.html">Read the docs</a>
  </p>
  <p class="small">Free and open source · Windows and Linux builds, published
  from the repository&rsquo;s own pipeline · no accounts, no server, your keys stay
  on your machine</p>
</section>

<section class="problem">
  <h2>The problem</h2>
  <p>Building software is a team game. Product works with Developers and QA,
  with feedback running constantly in every direction — about capability, about
  behaviour, about how the thing looks. AI lets all of that move faster. It also
  means AI is now putting its own spin on the product, the code, and the tests.</p>

  <h3>Given a vague description, AI wanders</h3>
  <ul class="problem-list">
    <li><strong>It builds what nobody asked for.</strong> Endpoints and features
    appear that were never in the plan.</li>
    <li><strong>It pays twice for the same work.</strong> Tokens go on creating,
    then recreating, something that already existed.</li>
    <li><strong>It moves faster than the team can absorb.</strong> Large changes
    at high speed overwhelm reviewers and destabilise production.</li>
  </ul>

  <h3>And the tooling splits the team up</h3>
  <p>Few tools give Product, Developers and QA one place to work at all. The AI
  tools that do exist are built around a single repository — not the several
  that a real product actually spans.</p>

  <h3>What this does about it</h3>
  <p>The answer is not a better prompt. It is a <strong>source of truth</strong>
  for the product that everyone including the AI works from, <strong>guardrails</strong>
  around it so the AI builds something developers can maintain, and — the part
  most tools leave out — <strong>somewhere for the AI to say what it cannot
  do</strong>. Instead of burning tokens guessing at a feature it does not
  understand, it says so, and hands the question back to a developer to answer
  or to Product to rethink.</p>
</section>

<section>
  <h2>One workflow, four environments</h2>
  <p>The window has four tabs, each its own colour so you always know where you
  are. A &ldquo;working as&rdquo; picker decides which you see.</p>
  <div class="cards">
    <div class="card">
      <h3>Product</h3>
      <p>Work items — features, bugs, tests, specs — plus a roadmap over time and
      a drag-and-drop feature designer. Specifications here generate the API
      endpoints, front-end changes and database designs.</p>
    </div>
    <div class="card">
      <h3>Develop</h3>
      <p>A code editor and a real OS terminal over the active repository, with
      several repositories registered at once — the multi-repo case most AI
      tooling skips.</p>
    </div>
    <div class="card">
      <h3>Test</h3>
      <p>QA writes scenarios in plain English against a work item; the AI
      implements them as real tests, within whatever that item&rsquo;s policy
      permits.</p>
    </div>
    <div class="card">
      <h3>Admin</h3>
      <p>Team members and roles, AI providers and models, and where agents are
      allowed to run — on this machine, in a Linux distribution the app owns, or
      in a container per run.</p>
    </div>
  </div>
</section>

<section class="feature">
  <h2>Deny by default, and honest about the difference</h2>
  <p>Every work item carries its own policy: whether the AI may read it, edit
  code for it, or generate tests for it, which provider it may use, and at what
  effort. Nothing is permitted unless the policy says so.</p>
  <p>The harder rule is the one the app holds itself to. A protection is either
  <strong>enforced</strong> — the operating system refuses the agent — or
  <strong>asked</strong>, meaning the agent has been requested and could be told
  otherwise. The two are never blurred into one reassuring icon, and where the
  app cannot prove containment it says so plainly. A sandbox that is only
  nominally one is worse than none, because it gets chosen by somebody who
  believes it protects them.</p>
  <p>Roles are the same story: they organise the workspace, and the app says
  outright that they are not a security boundary. There are no logins.</p>
</section>

<section>
  <h2>It is built with itself</h2>
  <p><strong>CoperativeAI</strong> is the desktop app; <strong>CooperativeAICoding</strong>
  is the framework it is built with — and increasingly the app designs its own
  features, generating the briefs that its own build loop then works from.</p>
  <p>Which is why the documentation here is not a summary written afterwards. It
  is the same set of briefs the work is actually done from, published as they
  stand, limitations and open questions included.</p>
  <p class="small">Every release carries a Windows installer and portable
  binary, and Linux packages — <code>.deb</code>, <code>.rpm</code> and an
  AppImage — built from the same commit by the same pipeline.</p>
  <p class="actions">
    <a class="cta" href="${LATEST}">Get the latest release</a>
    <a class="ghost" href="docs/${
      // The main window, which is where the app itself starts — not whichever
      // brief happens to sort first alphabetically.
      entries.find((e) => e.slug === "workspaceshell")?.slug ??
      entries.find((e) => e.brief)?.slug ??
      "index"
    }.html">Browse the briefs</a>
  </p>
</section>
`;
  return page({
    title: "CooperativeAICoding — Product, Developers, QA and AI working to one plan",
    description:
      "A desktop workspace where Product, Developers and QA plan, build and test with AI. Deny by default per work item, and never a claim of containment the app has not proved.",
    body,
    depth: 0,
    canonical: "/",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
