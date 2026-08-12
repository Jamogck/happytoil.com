# happytoil.com

The Happy Toil website. Astro, TypeScript, plain CSS, Markdown content, static output.
No database, no CMS, no client-side JavaScript in the shipped pages.

## Running it

Requires Node 22 or newer (`.nvmrc` pins 22).

```bash
nvm use && npm install && npm run dev
```

| Command           | What it does                                            |
| ----------------- | ------------------------------------------------------- |
| `npm run dev`     | Dev server at http://localhost:4321 — drafts are visible |
| `npm run build`   | Static build into `dist/` — drafts are excluded          |
| `npm run preview` | Serve the built site locally                             |
| `npm run check`   | Type-check the project                                   |

## Where things are

```
src/
  content/           Markdown and MDX — the actual site content
    work/            Client engagements, written as stories
    writing/         Essays
    products/        Products and experiments
  content.config.ts  Frontmatter schemas for the three collections
  pages/             Routes
  layouts/           Base, Page, Essay, Project, Product
  components/        The whole component vocabulary — deliberately small
  styles/global.css  Tokens, grid, prose, and every shared rule
  site.ts            Name, email, nav, footer copy, contact form endpoint
  lib/content.ts     Collection queries and sorting
public/              Files served as-is: favicon, robots.txt, _headers
```

## Writing

Add a `.md` file to the right folder under `src/content/`. Frontmatter is validated
against `src/content.config.ts`, so a typo fails the build rather than the page.

`draft: true` keeps an entry out of production builds while leaving it visible in
`npm run dev`. Everything currently in the repository is a draft — see `CONTENT.md`.

Markdown gets GFM tables, footnotes, and smart punctuation automatically. For an essay
that needs figures, pull quotes, callouts, or marginal notes, use `.mdx` and import the
components — `src/content/writing/specimen.mdx` shows every one of them in place.

Frontmatter strings are *not* run through smart punctuation, so type real apostrophes
(’) and quotes (“ ”) in titles and summaries.

## Deploying

Built for Cloudflare Pages, portable anywhere that serves static files.

- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22`

`public/_headers` sets security headers and long cache lifetimes for fingerprinted
assets; Cloudflare Pages reads it automatically, and other hosts ignore it.

## The contact form

`src/site.ts` has `formEndpoint: ''`. While it's empty, the contact page shows the
email address and no form — the form is never shipped in a state where it silently
goes nowhere. Point it at anything that accepts a normal form POST (a Cloudflare Pages
Function, Formspree, Netlify Forms) and the form appears.

## Design

The working style guide lives outside this repository. The short version:

- Warm off-white paper, near-black ink, brand color used sparingly.
- Source Serif 4 for reading, IBM Plex Sans for labels and technical matter.
- A twelve-column grid with named spans; essays hold to a 60–70 character measure.
- Almost no motion. Cards only where they solve an information problem — which is
  why the products grid is the one place that uses them, and why they're hairlines
  rather than rounded panels with shadows.
- One shared-element transition, and it's the only motion on the site beyond hover
  states: a work or product listing's thumbnail morphs into the detail page's hero
  photo on click (native View Transitions via Astro's `<ClientRouter />`, see
  `Thumb.astro`, `Figure.astro`, and `thumbTransitionName()` in `lib/content.ts`).
  Everything else on the page swaps instantly — no page-wide fade.

Before adding a component, treatment, or dependency: would it still look right in 2040?
