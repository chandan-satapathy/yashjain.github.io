# CLAUDE.md — Guidelines for AI assistance on this project

This file is read by Claude Code at the start of every session. Follow these guidelines precisely.

---

## What this project is

A personal portfolio site for Yash Jain (Management Consultant at Roland Berger). Hosted on GitHub Pages at `yashjain.github.io`. The site has four sections: Home, Work, Blog, Contact.

**Stack:** Plain HTML, CSS, and vanilla JS. No build step. No framework. No bundler. No package manager. Content is stored in `data/*.json` and `posts/*.md` files fetched client-side.

---

## Architecture rules — never break these

- **No build step.** Do not introduce npm, webpack, vite, or any tool that requires `npm install` or a compilation step. Every file the browser loads must be a static file that can be served directly.
- **No new dependencies.** Do not add CDN `<script>` tags for libraries without an explicit user request. The only external resources are Google Fonts and (on blog pages) `marked.js` from jsDelivr for markdown rendering.
- **Content lives in data files, not in HTML.** Home page text → `data/home.json`. Resume → `data/resume.json`. Blog posts → `posts/*.md` + `posts/manifest.json`. Do not hardcode content into HTML.
- **One CSS file, one JS file.** All styles go in `css/style.css`. All JS goes in `js/main.js`. Do not create additional `.css` or `.js` files.
- **All JS is ES5-compatible.** Use `var`, `function`, `.forEach`, `.then` — not `const`, `let`, arrow functions, `async/await`, or ES6 classes. The site targets broad browser compatibility without a transpiler.

---

## Design principles

### Aesthetic
The site has a deliberate editorial, monospace-first feel — clean, minimal, and slightly literary. It is not a flashy portfolio. Restraint is the goal.

- **Primary typeface:** Space Mono (monospace) — used for body text, nav, labels, and UI. This is the dominant voice of the site.
- **Accent typeface:** Playfair Display (serif) — used only for headings (`h1`, company names, post titles, the nav logo). Creates contrast with the monospace body.
- **Accent color:** `#C9A84C` (muted gold) — used sparingly for emphasis: timeline dots, active links, hover states, the blockquote border. Not for backgrounds or large areas.
- **Backgrounds:** Warm off-white (`#F9F7F4`) in light mode, near-black (`#111111`) in dark mode. Avoid pure white or pure black.

### Layout
- Single-column, centered layout. Max content width: `760px`.
- Generous vertical spacing between sections. Breathing room matters more than packing in information.
- No sidebars, no grids for content (the blog listing and home section cards are the only grid uses).

### Motion
- Transitions are `0.2s ease` for hover states (color, border, transform).
- Scroll-in animations use `IntersectionObserver` — fade + translate from below. Duration `0.5s ease`. Never loop; never autoplay continuously.
- The typewriter effect on the home page uses a 350ms initial delay and ~48ms per character. Do not speed it up.
- Use the `.fade-in` class + `animation-delay` for elements that animate on initial page load (hero section only).

### Dark mode
- Implemented via `[data-theme="dark"]` on the `<html>` element.
- Toggled by the sun/moon button in the nav; preference saved to `localStorage`.
- An anti-FOUC inline `<script>` in each `<head>` applies the stored theme before render. Do not remove this script.
- All colors must use CSS custom properties from `:root` — never hardcode hex values in component styles.

---

## Design tokens (single source of truth)

All tokens are in the `:root` block at the top of `css/style.css`. Change here, change everywhere.

| Token | Light value | Purpose |
|---|---|---|
| `--color-bg` | `#F9F7F4` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, blockquotes |
| `--color-text-1` | `#1A1A1A` | Headings, primary text |
| `--color-text-2` | `#6B6B6B` | Secondary / muted text |
| `--color-accent` | `#C9A84C` | Gold — links, dots, active states |
| `--color-border` | `#E5E0D8` | Card borders, dividers |
| `--color-nav-bg` | `rgba(249,247,244,0.88)` | Frosted nav background |
| `--font-sans` | `'Space Mono', monospace` | Body font |
| `--font-serif` | `'Playfair Display', serif` | Heading font |
| `--nav-height` | `64px` | Fixed nav bar height |
| `--max-width` | `760px` | Content column max width |
| `--radius` | `8px` | Card border radius |
| `--ease` | `0.2s ease` | Default transition |

---

## JS architecture

`js/main.js` is the single JS file. It uses `document.body.dataset.page` to route into page-specific init functions after `DOMContentLoaded`.

| `data-page` value | Init function | What it does |
|---|---|---|
| `home` | `initHome()` | Fetches `data/home.json`, runs typewriter, renders bio + quote |
| `work` | `initWork()` | Fetches `data/resume.json`, renders experience + education timelines, starts scroll animations |
| `blog-index` | `initBlogIndex()` | Fetches `../posts/manifest.json`, renders blog cards |
| `blog-post` | `initBlogPost()` | Reads `?slug=` from URL, fetches the `.md` file, renders with `marked.js` |

Key helpers: `renderBioMarkdown(bio)`, `renderExperienceEntry(entry)`, `renderEducationEntry(entry)`, `initScrollAnimations()`, `typewrite(id, text, speed)`, `formatDate(str)`, `escHtml(str)`, `extLinkIcon()`.

**Security rule:** All user-supplied or data-file content that is inserted as HTML must go through `escHtml()` first. The only exception is `renderBioMarkdown()` output, which builds its own safe HTML string from known-safe data file content, and `marked.parse()` output on the blog post page (markdown from `posts/*.md`).

---

## Content schema reference

### `data/home.json`
```json
{
  "tagline": "string — typewriter text",
  "quote":   "string — blockquote body",
  "quoteAuthor": "string — cite line",
  "bio": ["paragraph string", "..."]
}
```
Bio paragraphs support `**bold**` and `[link](url)` only.

### `data/resume.json`
```json
{
  "experience": [
    {
      "company": "string", "url": "string", "period": "string",
      "role": "string", "location": "string", "description": "string",
      "sections": [{ "label": "string", "bullets": ["string"] }]
    }
  ],
  "education": [
    {
      "institution": "string", "url": "string", "period": "string",
      "degree": "string", "details": "string",
      "bullets": ["string"]
    }
  ]
}
```

### `posts/manifest.json`
```json
[
  {
    "slug": "filename-without-extension",
    "title": "string",
    "date": "YYYY-MM-DD",
    "excerpt": "string"
  }
]
```

### `posts/*.md`
Plain Markdown. The blog post reader (`initBlogPost`) fetches the file at `posts/{slug}.md` and renders it with `marked.js`. Title and date come from the manifest, not from the file.

---

## Workflow guidelines

- Always create a feature branch from `main`. Never commit directly to `main`.
- Branch naming: `feature/short-description`.
- Test locally with `python3 -m http.server 8080` before raising a PR.
- One concern per PR. Do not bundle unrelated changes.
- When raising a PR, always set `--base main` explicitly.
- After a PR merges, start the next branch from a fresh `git fetch origin main`.

---

## What NOT to do

- Do not use `marked.setOptions()` — removed in marked v9. Pass options directly to `marked.parse(src, options)`.
- Do not open the site via `file://` to test — `fetch()` calls will silently fail.
- Do not add inline styles to HTML elements for anything other than `animation-delay` overrides on `.fade-in` elements.
- Do not introduce new Google Fonts — stick to Space Mono and Playfair Display.
- Do not use CSS `transform: translateY()` for scroll animations — use `translate` (the individual property) to avoid conflicting with `transform` on hover states.
- Do not hardcode colors — always use CSS custom properties.
- Do not write `async/await` or ES6+ syntax in `main.js`.
