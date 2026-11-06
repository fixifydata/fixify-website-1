(function () {
  'use strict';
  var dl = window.dataLayer = window.dataLayer || [];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- Mobile nav ---------- */
  var menuBtn = $('.menu-btn'), nav = $('#nav');
  function closeNav() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); }
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* ---------- Logos ----------
     id: [label, simple-icons slug, brand domain]. Tries Simple Icons CDN, then the brand favicon, then initials. */
  var LOGOS = {
    'ga4': ['GA4', 'googleanalytics', 'analytics.google.com'],
    'gtm': ['Google Tag Manager', 'googletagmanager', 'tagmanager.google.com'],
    'sgtm': ['Server-side GTM', 'googletagmanager', 'tagmanager.google.com'],
    'google-ads': ['Google Ads', 'googleads', 'ads.google.com'],
    'meta': ['Meta Conversions API', 'meta', 'meta.com'],
    'tiktok': ['TikTok Events API', 'tiktok', 'tiktok.com'],
    'linkedin': ['LinkedIn Ads', 'linkedin', 'linkedin.com'],
    'adobe-analytics': ['Adobe Analytics', 'adobe', 'adobe.com'],
    'adobe-launch': ['Adobe Launch', 'adobe', 'adobe.com'],
    'tealium': ['Tealium', 'tealium', 'tealium.com'],
    'amplitude': ['Amplitude', 'amplitude', 'amplitude.com'],
    'mixpanel': ['Mixpanel', 'mixpanel', 'mixpanel.com'],
    'posthog': ['PostHog', 'posthog', 'posthog.com'],
    'appsflyer': ['AppsFlyer', 'appsflyer', 'appsflyer.com'],
    'segment': ['Segment', 'segment', 'segment.com'],
    'rudderstack': ['RudderStack', 'rudderstack', 'rudderstack.com'],
    'cookiebot': ['Cookiebot', 'cookiebot', 'cookiebot.com'],
    'termly': ['Termly', 'termly', 'termly.io'],
    'usercentrics': ['Usercentrics', 'usercentrics', 'usercentrics.com'],
    'onetrust': ['OneTrust', 'onetrust', 'onetrust.com'],
    'looker': ['Looker Studio', 'looker', 'lookerstudio.google.com'],
    'powerbi': ['Power BI', 'powerbi', 'powerbi.microsoft.com'],
    'tableau': ['Tableau', 'tableau', 'tableau.com'],
    'bigquery': ['BigQuery', 'googlebigquery', 'cloud.google.com'],
    'snowflake': ['Snowflake', 'snowflake', 'snowflake.com'],
    'dbt': ['dbt', 'dbt', 'getdbt.com'],
    'shopify': ['Shopify', 'shopify', 'shopify.com'],
    'woocommerce': ['WooCommerce', 'woocommerce', 'woocommerce.com'],
    'bigcommerce': ['BigCommerce', 'bigcommerce', 'bigcommerce.com']
  };
  function initials(n) { return n.replace(/[^A-Za-z0-9 ]/g, '').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); }
  function logoImg(id) {
    var t = LOGOS[id];
    var img = new Image();
    img.width = 24; img.height = 24; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
    var src = ['https://cdn.simpleicons.org/' + t[1], 'https://www.google.com/s2/favicons?domain=' + t[2] + '&sz=64'], i = 0;
    img.onerror = function () {
      i++;
      if (i < src.length) img.src = src[i];
      else { var f = document.createElement('span'); f.className = 'logo-fallback'; f.setAttribute('aria-hidden', 'true'); f.textContent = initials(t[0]); img.replaceWith(f); }
    };
    img.src = src[0];
    return img;
  }
  // One-row marquee with all tools, duplicated once for a seamless loop
  var track = $('#marqueeTrack');
  [false, true].forEach(function (dup) {
    Object.keys(LOGOS).forEach(function (id) {
      var li = document.createElement('li');
      li.className = 'logo-tile';
      if (dup) li.setAttribute('aria-hidden', 'true');
      var label = document.createElement('span'); label.textContent = LOGOS[id][0];
      li.appendChild(logoImg(id)); li.appendChild(label);
      track.appendChild(li);
    });
  });
  // Logos inside the service panels
  $$('[data-logo]').forEach(function (li) { if (LOGOS[li.dataset.logo]) li.insertBefore(logoImg(li.dataset.logo), li.firstChild); });

  /* ---------- Area tabs: problems and services stay in sync ---------- */
  var AREA_NAMES = { 'ga4': 'GA4 & GTM', 'server-side': 'Server-side & CAPI', 'consent': 'Consent & CMP', 'app': 'App tracking', 'ecommerce': 'Ecommerce', 'data': 'Data & reporting' };
  var groups = $$('[role="tablist"][data-group]');
  function setArea(area, source) {
    groups.forEach(function (list) {
      $$('[role="tab"]', list).forEach(function (tab) {
        var on = tab.dataset.area === area;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
        if (on && list.scrollWidth > list.clientWidth) {
          list.scrollTo({ left: tab.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
        }
      });
    });
    if (source) dl.push({ event: 'area_select', area: AREA_NAMES[area], area_source: source });
  }
  groups.forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    var vertical = list.getAttribute('aria-orientation') === 'vertical';
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { setArea(tab.dataset.area, list.dataset.group); });
      tab.addEventListener('keydown', function (e) {
        var next = vertical ? 'ArrowDown' : 'ArrowRight', prev = vertical ? 'ArrowUp' : 'ArrowLeft', n = null;
        if (e.key === next || e.key === 'ArrowRight' || e.key === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        if (e.key === prev || e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); setArea(n.dataset.area, list.dataset.group); n.focus(); }
      });
    });
  });
  // "See how we fix…" and footer links jump to the matching service
  $$('[data-goto]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      setArea(b.dataset.goto, 'see_fix');
      $('#services').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(function () { $('#st-' + b.dataset.goto).focus({ preventScroll: true }); }, reduce ? 0 : 600);
    });
  });

  /* ---------- Lead form ---------- */
  var form = $('#leadForm');
  var steps = $$('.fstep', form);
  var progress = $('#progressBar'), stepLabel = $('#stepLabel');
  var err1 = $('#err1'), err2 = $('#err2');
  var started = false;
  function showStep(n) {
    steps.forEach(function (s) { s.hidden = s.dataset.step !== String(n); });
    progress.style.width = n === 1 ? '50%' : '100%';
    stepLabel.textContent = 'Step ' + n + ' of 2';
  }
  // "Talk to us about…" buttons preselect that area in the form
  $$('[data-pick]').forEach(function (b) {
    b.addEventListener('click', function () {
      var key = b.dataset.pick, box = $('input[data-key="' + key + '"]', form);
      if (box) box.checked = true;
      showStep(1);
      dl.push({ event: 'cta_click', cta_location: 'service_' + key });
      $('#contact').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(function () { if (box) box.focus({ preventScroll: true }); }, reduce ? 0 : 600);
    });
  });
  $$('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function () { dl.push({ event: 'cta_click', cta_location: a.dataset.cta }); });
  });
  form.addEventListener('change', function () {
    if (!started) { started = true; dl.push({ event: 'form_start', form_name: 'contact' }); }
  });
  $('#toStep2').addEventListener('click', function () {
    if (!$('input[name="services"]:checked', form)) {
      err1.textContent = 'Choose at least one area, or pick "Not sure yet".';
      $('input[name="services"]', form).focus();
      return;
    }
    err1.textContent = '';
    showStep(2);
    dl.push({ event: 'form_step', form_name: 'contact', form_step: 2 });
    form.elements.name.focus();
  });
  $('#backStep').addEventListener('click', function () { showStep(1); });

  // Attribution captured with every lead
  try {
    var q = new URLSearchParams(location.search), attr = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id']
      .forEach(function (k) { if (q.get(k)) attr[k] = q.get(k); });
    if (document.referrer) attr.referrer = document.referrer;
    attr.landing_page = location.href;
    form.elements.utm.value = JSON.stringify(attr);
  } catch (e) { /* ignore */ }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name, email = form.elements.email, site = form.elements.website, missing = [];
    [name, email].forEach(function (f) { f.removeAttribute('aria-invalid'); });
    if (!name.value.trim()) { missing.push('your name'); name.setAttribute('aria-invalid', 'true'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { missing.push('a valid work email'); email.setAttribute('aria-invalid', 'true'); }
    if (site.value.trim() && !/^https?:\/\//i.test(site.value.trim())) site.value = 'https://' + site.value.trim();
    if (missing.length) { err2.textContent = 'Add ' + missing.join(' and ') + ' so we can reply.'; (name.getAttribute('aria-invalid') ? name : email).focus(); return; }
    err2.textContent = '';

    var services = $$('input[name="services"]:checked', form).map(function (c) { return c.value; });
    var payload = {
      name: name.value.trim(), email: email.value.trim(), website: site.value.trim(),
      message: form.elements.message.value.trim(), services: services,
      stage: ($('input[name="stage"]:checked', form) || {}).value || '',
      attribution: form.elements.utm.value, fax: form.elements.fax.value
    };
    var btn = $('#submitBtn');
    btn.disabled = true; btn.textContent = 'Sending…';

    fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function () {
        dl.push({ event: 'generate_lead', form_name: 'contact', lead_services: services.join('|'), lead_stage: payload.stage });
        steps.forEach(function (s) { s.hidden = true; });
        stepLabel.hidden = true; progress.style.width = '100%';
        var done = $('#formDone'); done.hidden = false; done.focus();
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'Request my free call';
        var body = encodeURIComponent('Areas: ' + services.join(', ') + '\nStage: ' + payload.stage + '\nWebsite: ' + payload.website + '\n\n' + payload.message);
        err2.innerHTML = 'The form could not send. Email us instead at <a href="mailto:admin@fixifydata.xyz?subject=Free%20call%20request&body=' + body + '">admin@fixifydata.xyz</a>.';
        dl.push({ event: 'form_error', form_name: 'contact' });
      });
  });

  $('#yr').textContent = new Date().getFullYear();
})();
