/* ─── Theme ────────────────────────────────────────────────────────────── */
(function applyTheme() {
  try {
    document.documentElement.dataset.theme =
      localStorage.getItem('theme') || 'light';
  } catch (_) {}
})();

document.addEventListener('DOMContentLoaded', function () {

  /* ─── Theme toggle ─────────────────────────────────────────────────── */
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      const next =
        document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (_) {}
    });
  }

  /* ─── Hamburger nav ────────────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('navMobile');
  if (hamburger && navMobile) {
    hamburger.addEventListener('click', function () {
      const isOpen = navMobile.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    navMobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navMobile.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });
  }

  /* ─── Active nav link ──────────────────────────────────────────────── */
  const currentPage = document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach(function (a) {
    if (a.dataset.nav === currentPage) {
      a.classList.add('active');
    }
  });

  /* ─── Footer year ──────────────────────────────────────────────────── */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─── Page-specific init ───────────────────────────────────────────── */
  if (currentPage === 'home') initHome();
  if (currentPage === 'blog-index') initBlogIndex();
  if (currentPage === 'blog-post') initBlogPost();
});

/* ─── Home: typewriter ─────────────────────────────────────────────────── */
function initHome() {
  var text = 'Welcome to my little corner on the Internet.';
  var el = document.getElementById('typewriter');
  if (!el) return;

  var i = 0;
  var speed = 48; // ms per character

  function tick() {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(tick, speed);
    }
    // cursor blinks on naturally after typing ends
  }

  // Short delay before starting so the page settles
  setTimeout(tick, 400);
}

/* ─── Blog index: fetch manifest & render cards ────────────────────────── */
function initBlogIndex() {
  var grid = document.getElementById('blogGrid');
  if (!grid) return;

  // Path is relative to blog/index.html → one level up
  fetch('../posts/manifest.json')
    .then(function (r) {
      if (!r.ok) throw new Error('Could not load posts');
      return r.json();
    })
    .then(function (posts) {
      if (!posts || posts.length === 0) {
        grid.innerHTML =
          '<p class="blog-empty">No posts yet — check back soon.</p>';
        return;
      }

      // Sort newest first
      posts.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      grid.innerHTML = '';
      posts.forEach(function (post) {
        var card = document.createElement('a');
        card.className = 'blog-card';
        card.href = 'post.html?slug=' + encodeURIComponent(post.slug);
        card.innerHTML =
          '<div class="blog-card-date">' + formatDate(post.date) + '</div>' +
          '<div class="blog-card-title">' + escHtml(post.title) + '</div>' +
          (post.excerpt
            ? '<div class="blog-card-excerpt">' + escHtml(post.excerpt) + '</div>'
            : '');
        grid.appendChild(card);
      });
    })
    .catch(function () {
      grid.innerHTML =
        '<p class="blog-empty">No posts yet — check back soon.</p>';
    });
}

/* ─── Blog post: read ?slug=, fetch .md, render with marked ───────────── */
function initBlogPost() {
  var slug = new URLSearchParams(window.location.search).get('slug');
  var titleEl  = document.getElementById('postTitle');
  var dateEl   = document.getElementById('postDate');
  var bodyEl   = document.getElementById('postBody');

  if (!slug || !bodyEl) {
    if (bodyEl) bodyEl.innerHTML = '<p>Post not found.</p>';
    return;
  }

  fetch('../posts/' + encodeURIComponent(slug) + '.md')
    .then(function (r) {
      if (!r.ok) throw new Error('Post not found');
      return r.text();
    })
    .then(function (md) {
      // Pull metadata from manifest to populate title/date
      fetch('../posts/manifest.json')
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (posts) {
          var meta = posts.find(function (p) { return p.slug === slug; });
          if (meta) {
            if (titleEl) titleEl.textContent = meta.title;
            if (dateEl)  dateEl.textContent  = formatDate(meta.date);
            document.title = meta.title + ' — Yash Jain';
          }
        })
        .catch(function () {});

      // Render markdown
      if (typeof marked !== 'undefined') {
        marked.setOptions({ breaks: true, gfm: true });
        bodyEl.innerHTML = marked.parse(md);
      } else {
        // Fallback: show raw markdown in a pre block
        bodyEl.innerHTML = '<pre style="white-space:pre-wrap">' +
          escHtml(md) + '</pre>';
      }
    })
    .catch(function () {
      bodyEl.innerHTML = '<p>Post not found.</p>';
    });
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (_) {
    return dateStr;
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
