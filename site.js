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

  /* ---------- 3D hero visual (service pages) ----------
     The still poster shows at once. The live WebGL scene is fetched only after a real gesture
     (scroll, wheel, tap, click, key or sustained mouse movement), and never for a visitor who
     prefers reduced motion or has Data Saver on. Without WebGL, mounting fails and the poster stays. */
  var v3 = $('.hero-visual3d');
  if (v3) {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var saveData = navigator.connection && navigator.connection.saveData;
    if (!reduceMotion && !saveData) {
      var started = false, moves = 0;
      var EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown', 'pointermove', 'scroll'];
      var go = function (e) {
        // A scroll event at the very top can fire without the visitor doing anything (scroll restoration),
        // so only treat scrolling as a gesture once the page has actually moved.
        if (e && e.type === 'scroll' && window.scrollY < 40) return;
        // A real mouse produces a stream of pointermove events; a single stray one is not a gesture.
        if (e && e.type === 'pointermove' && ++moves < 3) return;
        if (started) return;
        started = true;
        EVENTS.forEach(function (ev) { window.removeEventListener(ev, go); });
        if (v3.getBoundingClientRect().bottom < -200) return; // already scrolled past: never build it
        // If the browser has no WebGL, mounting throws and the still poster simply stays.
        import('/assets/js/scene3d.js?v=1').then(function (m) {
          var s = m.mount(v3, v3.dataset.scene);
          window.__scene3d = s;
          return s.ready.then(function () { s.renderAt(1.2); v3.classList.add('is-live'); s.start(); });
        }).catch(function () { /* keep the poster */ });
      };
      EVENTS.forEach(function (ev) { window.addEventListener(ev, go, { passive: true }); });
    }
  }

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
