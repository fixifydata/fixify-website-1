/* Fixify shared behaviour: header menu, Services dropdown, mobile sticky bar and analytics events.
   Loaded on every page. Analytics events go through consent.js and are dropped unless the visitor accepted analytics. */
(function () {
  'use strict';
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function track(event, params) { return typeof window.fixifyTrack === 'function' ? window.fixifyTrack(event, params || {}) : false; }

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('.menu-btn'), nav = $('#nav');
  var dd = $('#dd'), ddb = $('#ddb');
  function setDD(open) { if (!dd) return; dd.classList.toggle('open', open); ddb.setAttribute('aria-expanded', String(open)); }
  function closeNav() {
    nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); setDD(false); document.documentElement.classList.remove('menu-open');
  }
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.classList.toggle('menu-open', open);
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });

  /* ---------- Services dropdown ---------- */
  if (dd) {
    var hoverMode = window.matchMedia('(hover:hover) and (min-width:861px)').matches;
    // With a mouse the menu already opens on hover, so a click keeps it open; keyboard (detail 0) and touch toggle.
    ddb.addEventListener('click', function (e) { setDD(hoverMode && e.detail > 0 ? true : !dd.classList.contains('open')); });
    if (hoverMode) {
      dd.addEventListener('mouseenter', function () { setDD(true); });
      dd.addEventListener('mouseleave', function () { setDD(false); });
    }
    dd.addEventListener('focusout', function (e) { if (e.relatedTarget && !dd.contains(e.relatedTarget)) setDD(false); });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) setDD(false); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (dd && dd.classList.contains('open')) { setDD(false); ddb.focus(); }
    closeNav();
  });

  /* ---------- Mobile sticky bar: hide while the contact section is on screen ---------- */
  var sticky = $('#stickyCta'), contact = $('#contact');
  if (sticky && contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { sticky.classList.toggle('is-hidden', en[0].isIntersecting); }, { threshold: 0.05 }).observe(contact);
  }

  /* ---------- Analytics events (one handler per element, one event per action) ---------- */
  $$('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function () { track('cta_click', { cta_label: a.textContent.replace(/\s+/g, ' ').trim(), cta_location: a.dataset.cta }); });
  });
  $$('[data-outbound]').forEach(function (a) {
    a.addEventListener('click', function () { track('outbound_click', { link_type: a.dataset.outbound, link_url: a.getAttribute('href') }); });
  });
  $$('.faq-list details').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) track('faq_open', { faq_question: $('summary', d).textContent.trim() }); });
  });
  var depthDone = {};
  window.addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h <= 0) return;
    var pct = window.scrollY / h * 100;
    [50, 90].forEach(function (t) {
      if (!depthDone[t] && pct >= t && track('scroll_depth', { percent_scrolled: t })) depthDone[t] = true;
    });
  }, { passive: true });

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
