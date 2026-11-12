/* Fixify consent layer.
   - Consent Mode v2 defaults (all denied) are set inline in each page's <head>.
   - GTM is loaded ONLY after the visitor accepts analytics (or has accepted before).
   - window.fixifyTrack(event, params) pushes to the dataLayer only while analytics consent is granted. */
(function () {
  'use strict';
  var KEY = 'fixify_consent_v1', GTM_ID = 'GTM-WX7FZ79N';
  var dl = window.dataLayer = window.dataLayer || [];
  function gtag() { dl.push(arguments); }
  var doc = document, root = doc.documentElement;

  function read() {
    try { var v = JSON.parse(localStorage.getItem(KEY)); return v && typeof v.analytics === 'boolean' ? v : null; } catch (e) { return null; }
  }
  function write(analytics) {
    try { localStorage.setItem(KEY, JSON.stringify({ analytics: analytics, ts: Date.now() })); } catch (e) { /* storage blocked: choice lasts this page only */ }
  }
  var state = read();

  var gtmLoaded = false;
  function loadGTM() {
    if (gtmLoaded) return;
    gtmLoaded = true;
    dl.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = doc.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    doc.head.appendChild(s);
  }
  function clearAnalyticsCookies() {
    var host = location.hostname, parts = host.split('.'), domains = [host, '.' + host];
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.')); else domains.push('.' + host);
    doc.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (/^(_ga|_gid|_gat|_gcl)/.test(n)) domains.forEach(function (d) { doc.cookie = n + '=; Max-Age=0; path=/; domain=' + d; doc.cookie = n + '=; Max-Age=0; path=/'; });
    });
  }
  function apply(analytics, userAction) {
    // Ads signals stay denied: this site runs no advertising.
    gtag('consent', 'update', { analytics_storage: analytics ? 'granted' : 'denied' });
    if (analytics) loadGTM(); else if (userAction) clearAnalyticsCookies();
  }
  function choose(analytics) {
    var was = state && state.analytics;
    write(analytics); state = { analytics: analytics, ts: Date.now() };
    apply(analytics, true);
    if (was && !analytics) dl.push({ event: 'consent_withdrawn' });
    closeBanner();
  }

  window.fixifyTrack = function (event, params) {
    if (!state || !state.analytics) return false;
    var o = { event: event };
    for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) o[k] = params[k];
    dl.push(o);
    return true;
  };
  window.fixifyHasConsent = function () { return !!(state && state.analytics); };

  /* ---------- Banner ---------- */
  var banner;
  function build() {
    banner = doc.createElement('div');
    banner.className = 'cc'; banner.id = 'cc'; banner.hidden = true;
    banner.setAttribute('role', 'dialog'); banner.setAttribute('aria-labelledby', 'cc-title'); banner.setAttribute('aria-describedby', 'cc-desc');
    banner.innerHTML =
      '<div class="cc-inner">' +
        '<div class="cc-text"><p class="cc-title" id="cc-title">Your privacy choices</p>' +
        '<p id="cc-desc">We’d like to use analytics cookies to see which parts of this site help. They stay off unless you say yes. Read our <a href="/cookie-policy">cookie policy</a>.</p></div>' +
        '<div class="cc-prefs" id="ccPrefs" hidden>' +
          '<label class="cc-row"><input type="checkbox" checked disabled><span><b>Necessary</b> Remembers your choice here. Always on.</span></label>' +
          '<label class="cc-row"><input type="checkbox" id="ccAnalytics"><span><b>Analytics</b> Anonymous visit and click statistics so we can improve the site.</span></label>' +
          '<button type="button" class="btn btn-gold" id="ccSave">Save choices</button>' +
        '</div>' +
        '<div class="cc-actions" id="ccActions">' +
          '<button type="button" class="btn cc-btn cc-reject" id="ccReject">Reject</button>' +
          '<button type="button" class="btn cc-btn cc-link" id="ccPrefsBtn" aria-expanded="false" aria-controls="ccPrefs">Preferences</button>' +
          '<button type="button" class="btn cc-btn cc-accept" id="ccAccept">Accept</button>' +
        '</div>' +
      '</div>';
    var skip = doc.querySelector('.skip');
    if (skip && skip.parentNode === doc.body) skip.insertAdjacentElement('afterend', banner); else doc.body.insertBefore(banner, doc.body.firstChild);
    doc.getElementById('ccAccept').addEventListener('click', function () { choose(true); });
    doc.getElementById('ccReject').addEventListener('click', function () { choose(false); });
    doc.getElementById('ccSave').addEventListener('click', function () { choose(doc.getElementById('ccAnalytics').checked); });
    doc.getElementById('ccPrefsBtn').addEventListener('click', function () { togglePrefs(); });
    banner.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state) closeBanner(true); });
  }
  function togglePrefs(force) {
    var p = doc.getElementById('ccPrefs'), b = doc.getElementById('ccPrefsBtn');
    var open = typeof force === 'boolean' ? force : p.hidden;
    p.hidden = !open; b.setAttribute('aria-expanded', String(open));
    doc.getElementById('ccAnalytics').checked = !!(state && state.analytics);
    sizePad();
  }
  function sizePad() { root.style.setProperty('--cc-h', banner && !banner.hidden ? banner.offsetHeight + 'px' : '0px'); }
  function openBanner(withPrefs) {
    if (!banner) build();
    banner.hidden = false; root.classList.add('cc-open');
    togglePrefs(!!withPrefs); sizePad();
    if (withPrefs) doc.getElementById('ccAnalytics').focus();
  }
  var opener = null;
  function closeBanner(restore) {
    if (!banner) return;
    banner.hidden = true; root.classList.remove('cc-open'); sizePad();
    if (restore && opener) opener.focus();
  }
  window.addEventListener('resize', sizePad);

  function init() {
    doc.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (t) { e.preventDefault(); opener = t; openBanner(true); }
    });
    if (state) { apply(state.analytics, false); return; }
    // The banner uses a system font (see styles.css), so it can appear immediately without shifting the layout.
    openBanner(false);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
