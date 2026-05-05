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
  if (currentPage === 'world')      initWorld();
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
   WORLD — fetch places.json + world.json, render map + stats
   ═══════════════════════════════════════════════════════════════════════ */
function initWorld() {
  var mapEl    = document.getElementById('worldMap');
  var groupEl  = document.getElementById('mapCountries');
  var cardEl   = document.getElementById('mapCard');
  var listEl   = document.getElementById('worldList');
  var counterEl = document.getElementById('counterNumber');
  var continentEl = document.getElementById('continentBreakdown');

  if (!mapEl || !groupEl) return;

  /* Fetch places + world GeoJSON in parallel */
  Promise.all([
    fetch('data/places.json').then(function (r) { return r.json(); }),
    fetch('data/world.json').then(function (r) { return r.json(); })
  ]).then(function (results) {
    var places = results[0];
    var geo    = results[1];

    /* Index visited countries by ISO code */
    var visited = {};
    places.forEach(function (p) { visited[p.code] = p; });

    /* Wishlist countries (dashed outline, no fill) */
    var wishlist = {};
    places.forEach(function (p) {
      if (p.wishlist) wishlist[p.code] = p;
    });

    /* ── Render SVG map via Mercator projection ── */
    var W = 960, H = 500;

    function projectPoint(lon, lat) {
      var x = (lon + 180) / 360 * W;
      var sinLat = Math.sin(lat * Math.PI / 180);
      var y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * H;
      return [x, y];
    }

    function ringToD(ring) {
      var d = '';
      ring.forEach(function (pt, i) {
        var proj = projectPoint(pt[0], pt[1]);
        d += (i === 0 ? 'M' : 'L') + proj[0].toFixed(2) + ',' + proj[1].toFixed(2);
      });
      return d + 'Z';
    }

    function geometryToD(geom) {
      if (!geom) return '';
      var d = '';
      if (geom.type === 'Polygon') {
        geom.coordinates.forEach(function (ring) { d += ringToD(ring); });
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach(function (poly) {
          poly.forEach(function (ring) { d += ringToD(ring); });
        });
      }
      return d;
    }

    geo.features.forEach(function (feat) {
      var iso  = feat.properties.iso;
      var name = feat.properties.name;
      var d    = geometryToD(feat.geometry);
      if (!d) return;

      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('data-iso', iso);
      path.setAttribute('data-name', name);

      var place = visited[iso];
      var isWish = wishlist[iso];

      if (place) {
        path.classList.add('country-visited');
      } else if (isWish) {
        path.classList.add('country-wishlist');
      } else {
        path.classList.add('country-unvisited');
      }

      /* Hover / touch interaction */
      if (place || isWish) {
        path.addEventListener('mouseenter', function (e) {
          showMapCard(e, place || isWish, !!isWish, cardEl);
        });
        path.addEventListener('mousemove', function (e) {
          positionCard(e, cardEl);
        });
        path.addEventListener('mouseleave', function () {
          cardEl.classList.remove('visible');
          cardEl.style.opacity = '0';
          /* remove locked state too */
          if (cardEl._locked) { cardEl._locked = false; }
        });
        /* Mobile tap: toggle lock */
        path.addEventListener('click', function (e) {
          if (cardEl._locked && cardEl._lockedIso === iso) {
            cardEl._locked = false;
            cardEl._lockedIso = null;
            cardEl.classList.remove('visible');
            cardEl.style.opacity = '0';
          } else {
            showMapCard(e, place || isWish, !!isWish, cardEl);
            positionCard(e, cardEl);
            cardEl._locked = true;
            cardEl._lockedIso = iso;
          }
        });
      }

      groupEl.appendChild(path);
    });

    /* ── Country counter animation ── */
    var total = places.filter(function (p) { return !p.wishlist; }).length;
    if (counterEl) animateCounter(counterEl, total);

    /* ── Continent breakdown ── */
    if (continentEl) {
      var breakdown = continentCount(places.filter(function (p) { return !p.wishlist; }));
      var parts = [];
      Object.keys(breakdown).sort().forEach(function (c) {
        parts.push('<span class="continent-pill">' + escHtml(c) + ' <strong>' + breakdown[c] + '</strong></span>');
      });
      continentEl.innerHTML = parts.join('');
    }

    /* ── Country list (below map) ── */
    if (listEl) {
      var sorted = places
        .filter(function (p) { return !p.wishlist; })
        .slice()
        .sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
      listEl.innerHTML = sorted.map(function (p) {
        var postLink = p.post
          ? ' <a class="world-list-post" href="blog/post.html?slug=' + encodeURIComponent(p.post) + '">Read &rarr;</a>'
          : '';
        var highlights = (p.highlights || []).map(function (h) {
          return '<li>' + escHtml(h) + '</li>';
        }).join('');
        var recs = (p.recommendations || []).map(function (r) {
          return '<li>' + escHtml(r) + '</li>';
        }).join('');
        return (
          '<div class="world-list-entry">' +
            '<div class="world-list-header">' +
              '<span class="world-list-country">' + escHtml(p.country) + '</span>' +
              '<span class="world-list-year">' + escHtml(String(p.year || '')) + postLink + '</span>' +
            '</div>' +
            (highlights ? '<div class="world-list-section-label">Highlights</div><ul class="world-list-bullets">' + highlights + '</ul>' : '') +
            (recs ? '<div class="world-list-section-label">Recommendations</div><ul class="world-list-bullets">' + recs + '</ul>' : '') +
          '</div>'
        );
      }).join('');
    }

    /* ── Dismiss card on outside click ── */
    document.addEventListener('click', function (e) {
      if (cardEl._locked && !e.target.closest('path')) {
        cardEl._locked = false;
        cardEl._lockedIso = null;
        cardEl.classList.remove('visible');
        cardEl.style.opacity = '0';
      }
    });

  }).catch(function (err) {
    if (groupEl) groupEl.innerHTML = '';
    console.error('World page load error:', err);
  });
}

function showMapCard(e, place, isWish, cardEl) {
  if (cardEl._locked) return;
  var post = place.post
    ? '<a class="map-card-post" href="blog/post.html?slug=' + encodeURIComponent(place.post) + '">Read &rarr;</a>'
    : '';
  var badge = isWish ? '<span class="map-card-wishlist-badge">Wishlist</span>' : '';
  var highlights = (place.highlights || []).map(function (h) {
    return '<li>' + escHtml(h) + '</li>';
  }).join('');
  var recs = (place.recommendations || []).map(function (r) {
    return '<li>' + escHtml(r) + '</li>';
  }).join('');

  cardEl.innerHTML =
    '<div class="map-card-head">' +
      '<span class="map-card-country">' + escHtml(place.country) + '</span>' +
      (place.year ? '<span class="map-card-year">' + place.year + '</span>' : '') +
      badge +
    '</div>' +
    (highlights ? '<div class="map-card-label">Highlights</div><ul class="map-card-list">' + highlights + '</ul>' : '') +
    (recs ? '<div class="map-card-label">Try this</div><ul class="map-card-list">' + recs + '</ul>' : '') +
    post;

  positionCard(e, cardEl);
  cardEl.style.opacity = '1';
  cardEl.classList.add('visible');
}

function positionCard(e, cardEl) {
  if (cardEl._locked) return;
  var rect = cardEl.parentElement.getBoundingClientRect();
  var x = e.clientX - rect.left + 12;
  var y = e.clientY - rect.top + 12;
  /* Flip if too close to right edge */
  if (x + 260 > rect.width) x = e.clientX - rect.left - 270;
  /* Flip if too close to bottom edge */
  if (y + cardEl.offsetHeight > rect.height) y = e.clientY - rect.top - cardEl.offsetHeight - 8;
  cardEl.style.left = x + 'px';
  cardEl.style.top  = y + 'px';
}

function animateCounter(el, target) {
  var start = null;
  var duration = 1200;
  function step(ts) {
    if (!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    /* Ease out cubic */
    var eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

/* Map ISO-A2 codes to continent names */
var ISO_CONTINENT = {
  AF:'Africa',DZ:'Africa',AO:'Africa',BJ:'Africa',BW:'Africa',BF:'Africa',BI:'Africa',
  CM:'Africa',CV:'Africa',CF:'Africa',TD:'Africa',KM:'Africa',CG:'Africa',CD:'Africa',
  CI:'Africa',DJ:'Africa',EG:'Africa',GQ:'Africa',ER:'Africa',ET:'Africa',GA:'Africa',
  GM:'Africa',GH:'Africa',GN:'Africa',GW:'Africa',KE:'Africa',LS:'Africa',LR:'Africa',
  LY:'Africa',MG:'Africa',MW:'Africa',ML:'Africa',MR:'Africa',MU:'Africa',MA:'Africa',
  MZ:'Africa',NA:'Africa',NE:'Africa',NG:'Africa',RW:'Africa',ST:'Africa',SN:'Africa',
  SL:'Africa',SO:'Africa',ZA:'Africa',SS:'Africa',SD:'Africa',SZ:'Africa',TZ:'Africa',
  TG:'Africa',TN:'Africa',UG:'Africa',ZM:'Africa',ZW:'Africa',
  AM:'Asia',AZ:'Asia',BH:'Asia',BD:'Asia',BT:'Asia',BN:'Asia',KH:'Asia',CN:'Asia',
  CY:'Asia',GE:'Asia',IN:'Asia',ID:'Asia',IR:'Asia',IQ:'Asia',IL:'Asia',JP:'Asia',
  JO:'Asia',KZ:'Asia',KW:'Asia',KG:'Asia',LA:'Asia',LB:'Asia',MY:'Asia',MV:'Asia',
  MN:'Asia',MM:'Asia',NP:'Asia',KP:'Asia',OM:'Asia',PK:'Asia',PS:'Asia',PH:'Asia',
  QA:'Asia',SA:'Asia',SG:'Asia',KR:'Asia',LK:'Asia',SY:'Asia',TW:'Asia',TJ:'Asia',
  TH:'Asia',TL:'Asia',TM:'Asia',AE:'Asia',UZ:'Asia',VN:'Asia',YE:'Asia',
  AL:'Europe',AD:'Europe',AT:'Europe',BY:'Europe',BE:'Europe',BA:'Europe',BG:'Europe',
  HR:'Europe',CZ:'Europe',DK:'Europe',EE:'Europe',FI:'Europe',FR:'Europe',DE:'Europe',
  GR:'Europe',HU:'Europe',IS:'Europe',IE:'Europe',IT:'Europe',XK:'Europe',LV:'Europe',
  LI:'Europe',LT:'Europe',LU:'Europe',MT:'Europe',MD:'Europe',MC:'Europe',ME:'Europe',
  NL:'Europe',MK:'Europe',NO:'Europe',PL:'Europe',PT:'Europe',RO:'Europe',RU:'Europe',
  SM:'Europe',RS:'Europe',SK:'Europe',SI:'Europe',ES:'Europe',SE:'Europe',CH:'Europe',
  UA:'Europe',GB:'Europe',VA:'Europe',
  AG:'Americas',AR:'Americas',BS:'Americas',BB:'Americas',BZ:'Americas',BO:'Americas',
  BR:'Americas',CA:'Americas',CL:'Americas',CO:'Americas',CR:'Americas',CU:'Americas',
  DM:'Americas',DO:'Americas',EC:'Americas',SV:'Americas',GD:'Americas',GT:'Americas',
  GY:'Americas',HT:'Americas',HN:'Americas',JM:'Americas',MX:'Americas',NI:'Americas',
  PA:'Americas',PY:'Americas',PE:'Americas',KN:'Americas',LC:'Americas',VC:'Americas',
  SR:'Americas',TT:'Americas',US:'Americas',UY:'Americas',VE:'Americas',
  AU:'Oceania',FJ:'Oceania',KI:'Oceania',MH:'Oceania',FM:'Oceania',NR:'Oceania',
  NZ:'Oceania',PW:'Oceania',PG:'Oceania',WS:'Oceania',SB:'Oceania',TO:'Oceania',
  TV:'Oceania',VU:'Oceania'
};

function continentCount(places) {
  var counts = {};
  places.forEach(function (p) {
    var c = ISO_CONTINENT[p.code] || 'Other';
    counts[c] = (counts[c] || 0) + 1;
  });
  return counts;
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
