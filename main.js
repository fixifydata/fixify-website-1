(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  // Analytics events go through consent.js; nothing is sent unless the visitor accepted analytics.
  function track(event, params) { return typeof window.fixifyTrack === 'function' ? window.fixifyTrack(event, params || {}) : false; }

  /* ---------- Area tabs: problems and services stay in sync ---------- */
  var AREA_NAMES = { 'analytics': 'Analytics and tag management', 'app': 'App tracking', 'ecommerce': 'Ecommerce tracking', 'server-side': 'Server-side tracking', 'consent': 'Consent and privacy', 'ad-platforms': 'Ad platforms', 'reporting': 'Data and reporting' };
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
    if (source) track('tab_select', { tab_area: AREA_NAMES[area], tab_group: source });
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
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); setArea(n.dataset.area, list.dataset.group); n.focus(); }
      });
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
  showStep(1);
  // "Let’s talk" buttons in the service panels preselect that area in the form
  $$('[data-pick]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      var box = $('input[data-key="' + b.dataset.pick + '"]', form);
      if (box) box.checked = true;
      showStep(1);
      $('#contact').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(function () { if (box) box.focus({ preventScroll: true }); }, reduce ? 0 : 600);
    });
  });
  // Service pages link here with ?area=<service> to preselect that area
  try {
    var pre = new URLSearchParams(location.search).get('area'), preBox = pre && $('input[data-key="' + pre + '"]', form);
    if (preBox) preBox.checked = true;
  } catch (e) { /* ignore */ }
  function markStart() { if (!started) { started = true; track('form_start', { form_name: 'contact' }); } }
  form.addEventListener('focusin', markStart);
  form.addEventListener('change', markStart);

  $('#toStep2').addEventListener('click', function () {
    if (!$('input[name="services"]:checked', form)) {
      err1.textContent = 'Choose at least one area, or pick “Not sure yet”.';
      $('input[name="services"]', form).focus();
      return;
    }
    err1.textContent = '';
    showStep(2);
    track('form_step_complete', { form_name: 'contact', form_step: 1 });
    form.elements.name.focus();
  });
  $('#backStep').addEventListener('click', function () { showStep(1); });

  // Inline validation
  var RULES = {
    name: function (v) { return v.trim() ? '' : 'Enter your name.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a work email, for example jane@company.com.'; },
    website: function (v) { v = v.trim(); if (!v) return ''; try { var u = new URL(/^https?:\/\//i.test(v) ? v : 'https://' + v); return u.hostname.indexOf('.') > 0 ? '' : 'Enter a valid web address, for example https://yourcompany.com.'; } catch (e) { return 'Enter a valid web address, for example https://yourcompany.com.'; } },
    message: function (v) { return v.trim() ? '' : 'Tell us briefly what you’re trying to solve.'; },
    consent: function (v, el) { return el.checked ? '' : 'Tick the box so we can use your details to reply.'; }
  };
  function check(name) {
    var el = form.elements[name], msg = RULES[name](el.value, el), out = $('#e-' + name);
    out.textContent = msg;
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    return !msg;
  }
  Object.keys(RULES).forEach(function (n) {
    var el = form.elements[n];
    el.addEventListener('blur', function () { if (el.type !== 'checkbox' && (el.value || el.dataset.touched)) check(n); });
    el.addEventListener('input', function () { el.dataset.touched = '1'; if (el.getAttribute('aria-invalid')) check(n); });
    el.addEventListener('change', function () { if (el.type === 'checkbox') check(n); });
  });

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
    var bad = ['name', 'email', 'website', 'message', 'consent'].filter(function (n) { return !check(n); });
    if (bad.length) { err2.textContent = 'Please fix the highlighted fields.'; form.elements[bad[0]].focus(); return; }
    err2.textContent = '';
    var site = form.elements.website;
    if (site.value.trim() && !/^https?:\/\//i.test(site.value.trim())) site.value = 'https://' + site.value.trim();

    var services = $$('input[name="services"]:checked', form).map(function (c) { return c.value; });
    var payload = {
      name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), company: form.elements.company.value.trim(),
      website: site.value.trim(), message: form.elements.message.value.trim(), services: services,
      stage: ($('input[name="stage"]:checked', form) || {}).value || '',
      consent: form.elements.consent.checked, attribution: form.elements.utm.value, fax: form.elements.fax.value
    };
    var btn = $('#submitBtn');
    btn.disabled = true; btn.textContent = 'Sending…';

    fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function () {
        track('form_submit', { form_name: 'contact' });
        track('generate_lead', { form_name: 'contact', lead_services: services.join('|'), lead_stage: payload.stage });
        steps.forEach(function (s) { s.hidden = true; });
        stepLabel.hidden = true; progress.style.width = '100%';
        var done = $('#formDone'); done.hidden = false; done.focus();
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'Let’s talk';
        var body = encodeURIComponent('Areas: ' + services.join(', ') + '\nStage: ' + payload.stage + '\nCompany: ' + payload.company + '\nWebsite: ' + payload.website + '\n\n' + payload.message);
        err2.innerHTML = 'The form couldn’t send. Please email us instead at <a href="mailto:admin@fixifydata.xyz?subject=Let%E2%80%99s%20talk&body=' + body + '">admin@fixifydata.xyz</a>.';
        track('form_error', { form_name: 'contact' });
      });
  });

})();
