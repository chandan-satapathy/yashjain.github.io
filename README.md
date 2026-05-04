# yashjain.github.io — Playbook

Personal portfolio site for Yash Jain, hosted on GitHub Pages. Plain HTML/CSS/JS — no build step, no framework, no dependencies beyond a Google Fonts import.

---

## Running locally

The site uses `fetch()` to load data files, so you must serve it over HTTP (not open `index.html` directly as a `file://` URL — fetches will fail silently).

```bash
# Python (built-in, no install)
python3 -m http.server 8080
# then open http://localhost:8080
```

Any static file server works (VS Code Live Server, `npx serve .`, etc.).

---

## File structure

```
yashjain.github.io/
├── index.html          # Home page
├── work.html           # Work / resume page
├── contact.html        # Contact page
├── blog/
│   ├── index.html      # Blog listing
│   └── post.html       # Individual post reader
├── css/
│   └── style.css       # All styles — design tokens at the top
├── js/
│   └── main.js         # All JS — page-specific init functions
├── data/
│   ├── home.json       # Home page content (tagline, bio, quote)
│   └── resume.json     # Work + education timeline entries
├── posts/
│   ├── manifest.json   # Blog index (slug, title, date, excerpt)
│   └── *.md            # Blog post content (one file per post)
└── assets/
    └── favicon.svg     # YJ monogram favicon
```

---

## How to edit each section

### Home page — `data/home.json`

All home page text lives here. Edit this file; the page fetches and renders it on load.

```json
{
  "tagline": "The line the typewriter animates on load.",
  "quote": "The blockquote text (no surrounding quotes needed).",
  "quoteAuthor": "Author Name",
  "bio": [
    "First paragraph. Supports **bold** and [link text](https://url).",
    "Second paragraph.",
    "Third paragraph."
  ]
}
```

- `bio` is an array of strings — one string per paragraph.
- Each paragraph supports `**bold**` and `[link](url)` inline markdown. No other markdown is processed here.
- To add or remove paragraphs, add or remove strings from the `bio` array.

---

### Work / Resume — `data/resume.json`

The Work page timeline is driven entirely by this file. It has two top-level arrays: `experience` and `education`.

**Experience entry shape:**
```json
{
  "company": "Company Name",
  "url": "https://company.com",
  "period": "Jan 2024 – Present",
  "role": "Job Title",
  "location": "City",
  "description": "One-line context shown under the role.",
  "sections": [
    {
      "label": "Section Heading (use empty string to omit the label)",
      "bullets": [
        "First bullet point.",
        "Second bullet point."
      ]
    }
  ]
}
```

**Education entry shape:**
```json
{
  "institution": "University Name",
  "url": "https://university.edu",
  "period": "2019 – 2021",
  "degree": "Degree Name",
  "details": "Short description shown under the degree.",
  "bullets": [
    "Achievement or highlight."
  ]
}
```

- Add new entries to the top of the `experience` array to keep newest-first order.
- All fields are plain text — no markdown is processed.

**Adding a downloadable CV:** drop a file named `resume.pdf` into the repo root. The "Download CV" link on the Work page already points to it.

---

### Blog — `posts/`

The blog has two parts: the manifest index and the post content files.

**Step 1 — Create the post file**

Add a `.md` file to `posts/`. The filename (without `.md`) becomes the URL slug.

```
posts/my-new-post.md
```

Write the post in plain Markdown. Use `##` and below for headings (the page title comes from the manifest, not from the file). Bold, italic, links, images, blockquotes, and code blocks all render.

```markdown
Opening paragraph with no heading.

## A section heading

Some content. **Bold**, *italic*, [links](https://example.com).

![Alt text](https://example.com/image.jpg)
```

**Step 2 — Register it in `posts/manifest.json`**

```json
{
  "slug": "my-new-post",
  "title": "My New Post Title",
  "date": "2025-11-01",
  "excerpt": "One or two sentences shown on the blog listing card."
}
```

- `slug` must exactly match the filename (without `.md`).
- `date` must be `YYYY-MM-DD`. Posts are sorted newest-first automatically.
- `excerpt` is optional but recommended — it appears on the listing card.

To remove a post, delete its `.md` file and remove its entry from `manifest.json`.

---

### Styling — `css/style.css`

All design tokens are at the top of `style.css` in the `:root` block. Change a token once and it updates everywhere.

```css
:root {
  --color-bg:      #F9F7F4;   /* page background */
  --color-surface: #FFFFFF;   /* cards, blockquotes */
  --color-text-1:  #1A1A1A;   /* headings, primary text */
  --color-text-2:  #6B6B6B;   /* secondary / muted text */
  --color-accent:  #C9A84C;   /* gold — links, dots, highlights */
  --color-border:  #E5E0D8;   /* card borders, dividers */

  --font-sans:  'Space Mono', 'Courier New', monospace;
  --font-serif: 'Playfair Display', Georgia, serif;

  --max-width: 760px;   /* content column width */
  --radius:    8px;     /* border radius for cards */
}
```

Dark mode overrides are in the `[data-theme="dark"]` block immediately below. Theme is toggled by the sun/moon button in the nav and saved to `localStorage`.

---

### Adding a profile photo

The avatar currently shows "YJ" initials. To swap in a photo:

1. Add your image to `assets/` (e.g. `assets/photo.jpg`).
2. In `index.html`, find the `hero-avatar` div and replace the `<span>` with an `<img>`:

```html
<div class="hero-avatar">
  <img src="assets/photo.jpg" alt="Yash Jain" />
</div>
```

The avatar is a `112px` circle with `object-fit: cover` — a square or portrait crop works best.

---

### Navigation and pages

Nav and footer links are hardcoded in each HTML file. If you add a new top-level page, update the `<nav>` and `<footer>` blocks in all five files: `index.html`, `work.html`, `contact.html`, `blog/index.html`, `blog/post.html`.

The active nav link is highlighted by matching `data-nav="..."` on the `<a>` tags against `document.body.dataset.page`. Each page sets its own `data-page="..."` on `<body>`.

---

## Deploying

The site is hosted on GitHub Pages from the `main` branch. Merging a PR into `main` deploys automatically within ~60 seconds — no CI or build step.

**Standard workflow:**
1. Create a branch off `main`.
2. Make changes, test locally with `python3 -m http.server 8080`.
3. Push the branch and open a PR against `main`.
4. Merge — done.
