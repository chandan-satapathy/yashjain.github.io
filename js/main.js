/* ─── Theme (runs immediately, before DOMContentLoaded) ────────────────── */
(function applyTheme() {
  try {
    document.documentElement.dataset.theme =
      localStorage.getItem('theme') || 'light';
  } catch (_) {}
})();

document.addEventListener('DOMContentLoaded', function () {

  /* ─── Theme toggle ─────────────────────────────────────────────────── */
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next =
        document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (_) {}
    });
  }

  /* ─── Hamburger nav ────────────────────────────────────────────────── */
  var hamburger = document.getElementById('hamburger');
  var navMobile = document.getElementById('navMobile');
  if (hamburger && navMobile) {
    hamburger.addEventListener('click', function () {
      var isOpen = navMobile.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
    navMobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navMobile.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ─── Active nav link ──────────────────────────────────────────────── */
  var currentPage = document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach(function (a) {
    if (a.dataset.nav === currentPage) a.classList.add('active');
  });

  /* ─── Footer year ──────────────────────────────────────────────────── */
  var yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─── Page-specific init ───────────────────────────────────────────── */
  if (currentPage === 'home')       initHome();
  if (currentPage === 'work')       initWork();
  if (currentPage === 'blog-index') initBlogIndex();
  if (currentPage === 'blog-post')  initBlogPost();
});

/* ═══════════════════════════════════════════════════════════════════════
   HOME — fetch data/home.json, render bio + quote
   ═══════════════════════════════════════════════════════════════════════ */
function initHome() {
  fetch('data/home.json')
    .then(function (r) {
      if (!r.ok) throw new Error('home.json not found');
      return r.json();
    })
    .then(function (data) {
      typewrite('typewriter', data.tagline || 'Welcome.');

      var bioEl = document.getElementById('heroBio');
      if (bioEl && data.bio) {
        bioEl.innerHTML = renderBioMarkdown(data.bio);
      }

      var quoteEl  = document.getElementById('heroQuote');
      var authorEl = document.getElementById('heroQuoteAuthor');
      if (quoteEl && data.quote)       quoteEl.textContent  = '“' + data.quote + '”';
      if (authorEl && data.quoteAuthor) authorEl.textContent = '— ' + data.quoteAuthor;
    })
    .catch(function () {
      typewrite('typewriter', 'Welcome to my little corner on the Internet.');
    });
}

/* ═══════════════════════════════════════════════════════════════════════
   WORK — fetch data/resume.json and render timeline
   ═══════════════════════════════════════════════════════════════════════ */
function initWork() {
  var expContainer = document.getElementById('experienceTimeline');
  var eduContainer = document.getElementById('educationTimeline');
  if (!expContainer && !eduContainer) return;

  fetch('data/resume.json')
    .then(function (r) {
      if (!r.ok) throw new Error('resume.json not found');
      return r.json();
    })
    .then(function (data) {
      if (expContainer && data.experience) {
        expContainer.innerHTML = data.experience
          .map(renderExperienceEntry)
          .join('');
      }
      if (eduContainer && data.education) {
        eduContainer.innerHTML = data.education
          .map(renderEducationEntry)
          .join('');
      }
    })
    .then(function () {
      initScrollAnimations();
    })
    .catch(function () {
      if (expContainer) expContainer.innerHTML =
        '<p class="loading">Could not load resume data.</p>';
      initScrollAnimations();
    });
}

function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.timeline-entry').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.timeline-entry').forEach(function (el) {
    observer.observe(el);
  });
}

function renderExperienceEntry(entry) {
  var sections = (entry.sections || [])
    .map(function (s) {
      var label = s.label
        ? '<div class="entry-sub-label">' + escHtml(s.label) + '</div>'
        : '';
      var bullets = (s.bullets || [])
        .map(function (b) { return '<li>' + escHtml(b) + '</li>'; })
        .join('');
      return label + '<ul class="entry-bullets">' + bullets + '</ul>';
    })
    .join('');

  return (
    '<div class="timeline-entry">' +
      '<div class="entry-header">' +
        '<a class="entry-company" href="' + escHtml(entry.url || '#') + '" ' +
          'target="_blank" rel="noopener noreferrer">' +
          escHtml(entry.company) +
          extLinkIcon() +
        '</a>' +
        '<span class="entry-dates">' + escHtml(entry.period) + '</span>' +
      '</div>' +
      '<p class="entry-meta">' +
        escHtml(entry.role) + ' · ' +
        escHtml(entry.location) + ' · ' +
        escHtml(entry.description) +
      '</p>' +
      sections +
    '</div>'
  );
}

function renderEducationEntry(entry) {
  var bullets = (entry.bullets || [])
    .map(function (b) { return '<li>' + escHtml(b) + '</li>'; })
    .join('');

  return (
    '<div class="timeline-entry">' +
      '<div class="entry-header">' +
        '<a class="entry-company" href="' + escHtml(entry.url || '#') + '" ' +
          'target="_blank" rel="noopener noreferrer">' +
          escHtml(entry.institution) +
          extLinkIcon() +
        '</a>' +
        '<span class="entry-dates">' + escHtml(entry.period) + '</span>' +
      '</div>' +
      '<p class="entry-meta">' +
        escHtml(entry.degree) + ' · ' +
        escHtml(entry.details) +
      '</p>' +
      '<ul class="entry-bullets">' + bullets + '</ul>' +
    '</div>'
  );
}

function extLinkIcon() {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
      '<polyline points="15 3 21 3 21 9"/>' +
      '<line x1="10" y1="14" x2="21" y2="3"/>' +
    '</svg>'
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BLOG INDEX — fetch manifest.json and render cards
   ═══════════════════════════════════════════════════════════════════════ */
function initBlogIndex() {
  var grid = document.getElementById('blogGrid');
  if (!grid) return;

  fetch('../posts/manifest.json')
    .then(function (r) {
      if (!r.ok) throw new Error('manifest not found');
      return r.json();
    })
    .then(function (posts) {
      if (!posts || posts.length === 0) {
        grid.innerHTML = '<p class="blog-empty">No posts yet — check back soon.</p>';
        return;
      }

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
      grid.innerHTML = '<p class="blog-empty">No posts yet — check back soon.</p>';
    });
}

/* ═══════════════════════════════════════════════════════════════════════
   BLOG POST — read ?slug=, fetch .md, render with marked
   ═══════════════════════════════════════════════════════════════════════ */
function initBlogPost() {
  var slug    = new URLSearchParams(window.location.search).get('slug');
  var titleEl = document.getElementById('postTitle');
  var dateEl  = document.getElementById('postDate');
  var bodyEl  = document.getElementById('postBody');

  if (!slug || !bodyEl) {
    if (bodyEl) bodyEl.innerHTML = '<p>Post not found.</p>';
    return;
  }

  /* Fetch the markdown content */
  fetch('../posts/' + encodeURIComponent(slug) + '.md')
    .then(function (r) {
      if (!r.ok) throw new Error('Post not found');
      return r.text();
    })
    .then(function (md) {
      /* Pull title/date from manifest */
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

      if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
        try {
          bodyEl.innerHTML = marked.parse(md, { breaks: true, gfm: true });
        } catch (_) {
          bodyEl.innerHTML = '<pre style="white-space:pre-wrap">' + escHtml(md) + '</pre>';
        }
      } else {
        bodyEl.innerHTML =
          '<pre style="white-space:pre-wrap">' + escHtml(md) + '</pre>';
      }
    })
    .catch(function () {
      if (titleEl) titleEl.textContent = 'Post not found';
      bodyEl.innerHTML = '<p>This post could not be loaded.</p>';
    });
}

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

/* Typewriter effect */
function typewrite(elementId, text, speed) {
  var el = document.getElementById(elementId);
  if (!el) return;
  speed = speed || 48;
  var i = 0;
  el.textContent = '';

  function tick() {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(tick, speed);
    }
  }
  setTimeout(tick, 350);
}

/* Format ISO date string → "October 1, 2025" */
function formatDate(dateStr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch (_) {
    return dateStr;
  }
}

/* Render bio: accepts a string or array of paragraph strings.
   Handles **bold** and [link](url) markdown inline. */
function renderBioMarkdown(bio) {
  var paragraphs = Array.isArray(bio) ? bio : bio.trim().split(/\n{2,}/);
  return paragraphs.map(function (para) {
    return '<p>' + para.trim()
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      + '</p>';
  }).join('');
}

/* Escape HTML special chars */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
