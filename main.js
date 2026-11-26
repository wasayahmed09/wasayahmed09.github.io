// =============================================
// wasay.dev
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  // --- Live clock (San Francisco, CA) ---
  // TIMEZONE -- change this when you move
  const LOCATION_TZ = 'America/Los_Angeles';

  function updateClock() {
    const el = document.getElementById('location-time');
    if (!el) return;
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: LOCATION_TZ,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    }).formatToParts(now);

    const get = (type) => (parts.find(p => p.type === type) || {}).value || '';
    const hour = get('hour');
    const minute = get('minute');
    const dayPeriod = get('dayPeriod').toLowerCase();
    const tzName = get('timeZoneName');

    // Geist Mono strictly on numerals; Geist Sans on am/pm and timezone label
    el.innerHTML = `<span class="mono">${hour}:${minute}</span> ${dayPeriod} ${tzName}`;
  }

  updateClock();
  setInterval(updateClock, 30000);

  // --- Subtle scroll reveal ---
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.work, .learnings, .content-section, .people, .site-footer').forEach(el => {
    el.classList.add('reveal-section');
    sectionObserver.observe(el);
  });

  // --- Smooth scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const pos = target.getBoundingClientRect().top + window.pageYOffset - 36;
        window.scrollTo({ top: pos, behavior: 'smooth' });
      }
    });
  });
});

// --- Last updated (fetches latest commit date from GitHub) ---
(function setLastUpdated() {
  const el = document.getElementById('last-updated');
  if (!el) return;
  const dateEl = el.querySelector('.lu-date');
  if (!dateEl) return;

  const REPO = 'wasayahmed09/wasayahmed09.github.io';
  const CACHE_KEY = 'wasay-last-updated-v2';
  const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
  const DISPLAY_TZ = 'America/Los_Angeles';

  function formatNumericDate(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: DISPLAY_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(d);
    const get = (t) => (parts.find(p => p.type === t) || {}).value || '';
    return `${get('year')}-${get('month')}-${get('day')}`;
  }

  function render(iso) {
    const formatted = formatNumericDate(iso);
    if (!formatted) return;
    dateEl.textContent = formatted;
  }

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && cached.iso && (Date.now() - cached.ts) < CACHE_TTL) {
      render(cached.iso);
    }
  } catch (_) {}

  fetch(`https://api.github.com/repos/${REPO}/commits/main`, {
    headers: { 'Accept': 'application/vnd.github+json' }
  })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => {
      const iso = data && data.commit && data.commit.committer && data.commit.committer.date;
      if (!iso) return;
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ iso, ts: Date.now() })); } catch (_) {}
      render(iso);
    })
    .catch(() => {
      // Keep the static fallback date in HTML if API is unavailable
    });
})();
