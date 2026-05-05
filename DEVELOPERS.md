## For Developers

---

### Running locally

The site uses `fetch()` to load data files, so you must serve it over HTTP (not open `index.html` directly as a `file://` URL — fetches will fail silently).

```bash
# Python (built-in, no install)
python3 -m http.server 8080
# then open http://localhost:8080
```

Any static file server works (VS Code Live Server, `npx serve .`, etc.).

---

### File structure

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

### Navigation and pages

Nav and footer links are hardcoded in each HTML file. If you add a new top-level page, update the `<nav>` and `<footer>` blocks in all five files: `index.html`, `work.html`, `contact.html`, `blog/index.html`, `blog/post.html`.

The active nav link is highlighted by matching `data-nav="..."` on the `<a>` tags against `document.body.dataset.page`. Each page sets its own `data-page="..."` on `<body>`.

---

### Deploying

The site is hosted on GitHub Pages from the `main` branch. Merging a PR into `main` deploys automatically within ~60 seconds — no CI or build step.

**Standard workflow:**
1. Create a branch off `main`.
2. Make changes, test locally with `python3 -m http.server 8080`.
3. Push the branch and open a PR against `main`.
4. Merge — done.
