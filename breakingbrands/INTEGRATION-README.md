# Breaking Brands → Crennect integration guide

This `breakingbrands/` folder is a **self-contained subsite**. Dropping it into your
Crennect repo will not touch, rename, or restyle anything in your existing site.

Live URL: `https://www.crennect.com/breakingbrands/`
Matched to your main site: **`www.` domain** and **extensionless (clean) URLs**, exactly
like `/about`, `/services`, `/genai`.
(Different domain later? One find-and-replace across this folder:
`www.crennect.com/breakingbrands` → your domain/path.)

---

## 1. Where to put it

Copy this whole `breakingbrands/` folder into the **root of your Crennect repo** —
the same level as your main site's home page.

```
your-crennect-repo/
├── (main Crennect home)     ← untouched
├── assets/                  ← your main assets: images/ sounds/ video/ ... (untouched)
├── sitemap.xml              ← REPLACE with the merged one (see step 5)
├── robots.txt               ← add 1 line (see step 4)
└── breakingbrands/          ← this folder (drop in as-is)
    ├── index.html           ← Breaking Brands home  → served at /breakingbrands/
    ├── apply.html  arena.html  autopsies.html
    ├── heat-index.html  newsletter.html  series.html  watch.html
    ├── llms.txt
    └── assets/              ← BB's own css/js/images (styles.css, home.css, main.js, logos)
```

Resulting URLs (clean, no `.html`):
`/breakingbrands/`, `/breakingbrands/apply`, `/breakingbrands/watch`,
`/breakingbrands/heat-index`, `/breakingbrands/autopsies`, `/breakingbrands/arena`,
`/breakingbrands/series`, `/breakingbrands/newsletter`.

The `.html` files stay on disk (that's normal — your host serves them at the clean paths).

## 2. Why nothing collides — including the `index` name

- **`index` page name:** your main home is served at `/` and BB's home at `/breakingbrands/`.
  Both source files are named `index.html`, but they live in different folders, so they are
  different URLs. They never meet. No conflict.
- **CSS / class names:** BB's `styles.css` has global selectors (`:root`, `body`,
  `section`, `nav`, `footer`, `h1–h4`). Those would only clash **if the same page loaded
  both stylesheets.** Your main pages never load `breakingbrands/assets/styles.css`, and BB
  pages never load your main CSS — separate documents — so there is zero bleed. No renaming
  or `bb-` prefixing needed.
- **JS:** `main.js` runs only on BB pages and only touches BB element IDs. Cannot affect
  your main site.
- **Assets:** BB carries its own `assets/` folder, so your segregated `images/ sounds/
  video/ favicon/ icons/` folders are untouched.
- **All internal links are relative** (`assets/styles.css`, `apply`, `./`), which is why the
  folder works unchanged in a subfolder.

## 3. Link to it from your main site

Point your existing "Breaking Brands" button/section on the Crennect site to:

```html
<a href="/breakingbrands/">Breaking Brands</a>
```

## 4. robots.txt  (one manual line)

A `robots.txt` inside a subfolder is **ignored** — crawlers read it only from the domain
root. So this folder includes none. Add this line to your **existing root `robots.txt`**:

```
Sitemap: https://www.crennect.com/sitemap.xml
```

If your root already allows crawlers (`User-agent: *` / `Allow: /`), Breaking Brands is
covered automatically. (The AI/LLM crawlers BB originally welcomed — GPTBot, ClaudeBot,
PerplexityBot, OAI-SearchBot, Google-Extended, Applebot-Extended, Bytespider, cohere-ai —
are all allowed by a blanket `Allow: /`.)

## 5. sitemap.xml  (ONE merged file — as you asked)

There is now a **single** sitemap. Use the merged `sitemap.xml` I placed one level up
(alongside this folder). It contains all your existing Crennect URLs **plus** the 8 Breaking
Brands URLs. Replace your current root `sitemap.xml` with it.

Two things it also fixed in your current sitemap:
- Your `prasad-dani` entry had a double protocol (`https://https://…`) — corrected.
- Standardized every entry on the `www.` domain.

Do **not** keep a second sitemap inside `/breakingbrands/` — that's why I removed it.

## 6. Hosting note (Netlify / Vercel)

Your main pages already serve without `.html`, so your host is already doing clean-URL
rewriting and Breaking Brands inherits it automatically — no new config needed.
- **Vercel:** this is `cleanUrls: true` in `vercel.json` (likely already set for your site).
- **Netlify:** "Pretty URLs" / asset optimization (likely already on).

The nav-active highlighting in `main.js` was rewritten to be path-based, so it works whether
a page is served as `/breakingbrands/apply` or `/breakingbrands/apply.html`.

## 7. What I changed vs. your original BB files

- Domain + path: every `https://breakingbrands.com/…` → `https://www.crennect.com/breakingbrands/…`
  (canonical, og:url, twitter, schema.org `@id`/`url`, and `llms.txt`).
- Made URLs extensionless to match your main site: internal links and canonicals dropped
  `.html`; the home link is `./`.
- Rewrote the `main.js` nav-highlight function to compare normalized paths (works with or
  without `.html`).
- Merged the BB sitemap into your single root sitemap; removed the standalone one.
- Left out the `.bat` preview script and `.docx` blueprint (not part of the website).

No markup structure, CSS rules, class names, layout, or copy were altered.
