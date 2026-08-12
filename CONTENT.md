# What still needs you

Everything currently in `src/content/` is marked `draft: true`. Drafts render in
`npm run dev` and are excluded from `npm run build`, so a production deploy today ships
the pages and the design with empty listings — nothing invented reaches a reader.

The samples exist so you can see the layouts working and have a shape to write into.
Replace the text, remove the `SAMPLE` comment at the top of the file, set `draft: false`.

## Written by me, not by you — replace before publishing

| File                                             | What it is                                             |
| ------------------------------------------------ | ------------------------------------------------------ |
| `src/content/work/*.md` (3 files)                 | Invented engagements. Real structure, fictional details |
| `src/content/writing/the-spreadsheet-is-the-system.md` | Sample essay                                       |
| `src/content/writing/counting-your-own-labor.md`  | Sample essay                                           |
| `src/content/products/*.md` (3 files)             | Your real projects, described from the names alone      |

The three product entries name things that actually exist — GrazeMetrics,
PasturedBroilers.com, TreeGrowthRates.com — but I wrote the descriptions by inference.
Read them closely before publishing; several details are probably wrong.

`src/content/writing/specimen.mdx` is different: it's a typographic reference, not an
essay. Keep it as a permanent draft and consult it whenever you need to set something
new.

## Pages with copy worth reviewing

- `src/pages/about.astro` — the practice, and the Ecclesiastes note under "The name".
  The biography is deliberately about how you work rather than facts I'd be guessing at.
- `src/pages/index.astro` — the opening statement and the closing invitation.
- `src/pages/contact.astro` — what you ask people to send.
- `src/pages/colophon.astro` — accurate as written.

## Photographs

`src/assets/photos/` holds three placeholders, taken from the 2022 branding folder
(licensed stock, downscaled to 2000px). They're used on the About page and in the
specimen essay and are named `placeholder-*` so they're easy to find.

`src/assets/thumbs/` holds six square crops of those same three photographs, used as
the listing thumbnails on the work rows and in the products grid. They're abstract
close-ups, which is fine for showing the layout and wrong for the real site.

Thumbnails come from the `thumb` field, falling back to `image` if there isn't one.
Square sources work best — the work rows crop to a square, the product cells to 4:3 on
desktop and a square on a phone. An entry with no image at all gets a ruled blank
rather than a gap, so a half-finished list still holds its shape.

Thumbnails are decorative by default: the entry title is what a screen reader
announces for the link, so the image gets an empty alt. Set `thumbAlt` only when the
photograph carries something the title doesn't.

The listing thumbnail and the detail page's hero photo are the same image by design:
if a work or product entry has no `image`, the detail page shows `thumb` at full size
instead, and in supporting browsers the thumbnail morphs into place on click rather
than hard-cutting (Astro's View Transitions, `thumbTransitionName()` in
`src/lib/content.ts`). Nothing to configure — it follows automatically from `thumb`
and `image`. Writing has no thumbnails, so essays aren't part of this.

Replace them with photographs of real things: the farm, a shop floor, a client's
operation, tools, a screen mid-task, a notebook. Evidence rather than decoration. A
slightly imperfect real photograph beats a polished stock one.

Captions should add information the image can't carry — where, when, why it mattered.

## Settings

`src/site.ts` holds the handful of facts the site repeats:

- `place` — set it to your town and state to show it in the footer, or leave `''`.
- `formEndpoint` — set it to turn the contact form on.
- `footerNote` — the low-volume line in the footer.

## Frontmatter reference

**work** — `title` (name the outcome, not the deliverable), `business`, `summary`,
`year`, optional `through`, `facts[]`, optional `image`/`imageAlt`/`imageCaption`,
optional `thumb`/`thumbAlt`, `featured`, `draft`, `order`.

**writing** — `title`, optional `standfirst`, `summary`, `published`, optional
`updated`, optional `image`/`imageAlt`, `featured`, `draft`.

**products** — `title`, `summary`, optional `url`, `status`
(`running` | `in progress` | `experiment` | `retired`), `year`, `facts[]`, optional
`image`/`imageAlt`, optional `thumb`/`thumbAlt`, `featured`, `draft`, `order`.

`featured: true` promotes a work entry to the home page; the home page falls back to the
three most recent if nothing is featured.
