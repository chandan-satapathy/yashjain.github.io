# yashjain.github.io — Playbook

Personal portfolio site for Yash Jain, hosted on GitHub Pages. Plain HTML/CSS/JS — no build step, no framework, no dependencies beyond a Google Fonts import.

## How to edit each section

### 1. Home page — `data/home.json`

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

### 2. Work / Resume — `data/resume.json`

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

### 3. Blog — `posts/`

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

### 4. Styling — `css/style.css`

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

### 5. Adding a profile photo

Add your image to `assets/` (e.g. `assets/photo.jpg`).

---











