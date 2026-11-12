import { S, G, by, url, ORDER, HUB, FLOW, LNAME } from './data.mjs';
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const BASE = 'https://fixifydata.xyz';

// ---- logos ----
const WM = { 'GA4': 'ga4', 'Google Tag Manager': 'gtm', 'Adobe Analytics': 'adobe-analytics', 'Tealium': 'tealium', 'Firebase': 'firebase', 'AppsFlyer': 'appsflyer', 'Amplitude': 'amplitude', 'Mixpanel': 'mixpanel', 'PostHog': 'posthog', 'Shopify': 'shopify', 'RudderStack': 'rudderstack', 'Segment': 'segment', 'Cookiebot': 'cookiebot', 'OneTrust': 'onetrust', 'Google Ads': 'google-ads', 'Meta Ads': 'meta', 'TikTok Ads': 'tiktok', 'LinkedIn Ads': 'linkedin', 'Looker Studio': 'looker', 'Power BI': 'powerbi', 'BigQuery': 'bigquery', 'Snowflake': 'snowflake', 'Google Cloud': 'google-cloud', 'Adobe Launch': 'adobe', 'Usercentrics': 'usercentrics', 'Termly': 'termly', 'Tableau': 'tableau', 'Snapchat Ads': 'snapchat', 'Pinterest Ads': 'pinterest' };
const ICON = { 'WooCommerce': 'woocommerce', 'BigCommerce': 'bigcommerce', 'Server-side GTM': 'sgtm' };
export const wmImg = (id, cls, w, h) => `<img class="${cls}" src="/assets/logos/carousel/${id}.webp" alt="" width="${w}" height="${h}" loading="lazy" decoding="async">`;
// A tool chip: the supplied wordmark when we have one, else icon + name, else the name.
export const chip = name => WM[name]
  ? `<li class="lchip">${wmImg(WM[name], 'lc', 120, 33)}<span class="sr">${esc(name)}</span></li>`
  : ICON[name] ? `<li class="lchip lt"><img src="/assets/logos/${ICON[name]}.svg" alt="" width="20" height="20" loading="lazy"><span>${esc(name)}</span></li>`
  : `<li class="lchip lt"><span>${esc(name)}</span></li>`;
export const chips = names => `<ul class="logo-chips">${names.map(chip).join('')}</ul>`;
// The sliding bar: only the supplied logos, in the requested order.
export const BAR = [['tealium','Tealium'],['segment','Segment'],['gtm','Google Tag Manager'],['meta','Meta Conversions API'],['google-ads','Google Ads'],['amplitude','Amplitude'],['mixpanel','Mixpanel'],['adobe-analytics','Adobe Analytics'],['ga4','GA4'],['posthog','PostHog'],['appsflyer','AppsFlyer'],['firebase','Firebase'],['rudderstack','RudderStack'],['onetrust','OneTrust'],['cookiebot','Cookiebot'],['bigquery','BigQuery'],['snowflake','Snowflake'],['looker','Looker Studio'],['powerbi','Power BI'],['shopify','Shopify'],['tiktok','TikTok Events API'],['linkedin','LinkedIn Ads']];
const barLi = ([id, n]) => `          <li class="logo-slide"><img src="/assets/logos/carousel/${id}.webp" alt="" width="160" height="44" decoding="async"><span class="sr">${esc(n)}</span></li>`;
export const toolsBar = () => `<section class="tools" aria-labelledby="tools-title">
  <h2 id="tools-title" class="tools-pill">Tools we work with</h2>
  <div class="marquee" id="marquee">
    <div class="marquee-track">
      <ul class="marquee-list">
${BAR.map(barLi).join('\n')}
      </ul>
      <ul class="marquee-list" aria-hidden="true">
${BAR.map(barLi).join('\n')}
      </ul>
    </div>
  </div>
</section>`;

// ---- shared chrome ----
export const GA = `<script>
  /* Google Consent Mode v2: everything denied until the visitor chooses. GTM loads only after consent (see /consent.js). */
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied', functionality_storage:'denied', personalization_storage:'denied', security_storage:'granted'});
</script>`;
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">`;
const ICONS = `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;
export const head = ({ title, desc, path, robots = 'index, follow, max-image-preview:large, max-snippet:-1', ld = '' }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${GA}
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${path ? `<link rel="canonical" href="${BASE}${path}">` : ''}
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#071233">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Fixify">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
${path ? `<meta property="og:url" content="${BASE}${path}">` : ''}
<meta property="og:image" content="${BASE}/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Fixify. We fix the tracking behind your MarTech.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${BASE}/assets/og-image.png">
${ICONS}
${FONTS}
<link rel="preload" as="image" href="/assets/logo-light.webp" type="image/webp">
<link rel="stylesheet" href="/styles.css">
${ld}
</head>`;

export const header = (current) => {
  const groups = G.map(([t, ids]) => `<div class="panel-col"><p class="panel-h">${t}</p>${ids.map(i => { const s = by(i); return `<a href="${url(i)}"${current === i ? ' aria-current="page"' : ''}><b>${esc(s[1])}</b><small>${esc(s[2])}</small></a>`; }).join('')}</div>`).join('');
  return `<a class="skip" href="#main">Skip to content</a>

<header class="site-header" id="top">
  <div class="wrap header-inner">
    <a href="/" class="brand" aria-label="Fixify home">
      <img src="/assets/logo-light.webp" alt="Fixify" width="150" height="50">
    </a>
    <nav class="nav" id="nav" aria-label="Main">
      <div class="dd" id="dd">
        <button type="button" class="dd-btn" id="ddb" aria-expanded="false" aria-controls="pn">Services <span class="caret" aria-hidden="true"></span></button>
        <div class="panel" id="pn">${groups}<a class="panel-all" href="/#services">All services</a></div>
      </div>
      <a href="/#process">How it works</a>
      <a href="/#sectors">Sectors</a>
      <!-- Team link: restore with the #team section on the homepage when real team members are ready. -->
      <a href="/#faq">FAQ</a>
      <a href="/#contact" class="btn btn-gold nav-cta" data-cta="nav">Let’s talk</a>
    </nav>
    <button class="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="Open menu"><span></span><span></span></button>
  </div>
</header>`;
};

export const footer = () => `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <img src="/assets/logo-light.webp" alt="Fixify" width="150" height="50" loading="lazy">
      <p>Analytics and tracking consultants. Strategy, implementation and support for web, app and ecommerce measurement.</p>
    </div>
    <nav aria-label="What we do">
      <p class="foot-h">What we do</p>
${S.map(s => `      <a href="${url(s[0])}">${esc(s[1])}</a>`).join('\n')}
    </nav>
    <nav aria-label="Company">
      <p class="foot-h">Company</p>
      <a href="/#process">How it works</a>
      <a href="/#sectors">Sectors</a>
      <!-- <a href="/#team">Team</a> (restore with the #team section) -->
      <a href="/#faq">FAQ</a>
      <a href="/#contact">Contact</a>
    </nav>
    <div>
      <p class="foot-h">Say hi</p>
      <a class="foot-link" href="mailto:admin@fixifydata.xyz" data-outbound="email">admin@fixifydata.xyz</a>
      <a class="foot-link" href="https://www.linkedin.com/company/fixifydata" target="_blank" rel="noopener" data-outbound="linkedin">LinkedIn</a>
      <a class="btn btn-gold foot-cta" href="/#contact" data-cta="footer">Let’s talk</a>
    </div>
  </div>
  <div class="wrap footer-base">
    <p>© <span id="yr">2026</span> Fixify. We fix. You grow.</p>
    <p class="legal-links"><a href="/privacy-policy">Privacy policy</a> <a href="/cookie-policy">Cookie policy</a> <button type="button" class="linklike" data-cookie-settings>Cookie settings</button> <a href="#top">Back to top</a></p>
  </div>
  <div class="wrap"><p class="tm-note">All product names and logos are trademarks of their respective owners. Use does not imply endorsement.</p></div>
</footer>

<div class="sticky-cta" id="stickyCta"><a class="btn btn-gold btn-block" href="/#contact" data-cta="sticky">Let’s talk</a></div>`;

export const scripts = (extra = '') => `<script src="/consent.js" defer></script>
<script src="/site.js" defer></script>${extra}`;

// ---- explanatory flow diagram (logos + plain-English steps) ----
export function flow(id) {
  const f = FLOW[id], h = HUB[id];
  let n = 0;
  const node = x => x.l
    ? `<div class="fnode"><img class="fi" src="/assets/logos/carousel/${x.l}.webp" alt="${esc(LNAME[x.l])}" width="120" height="33" loading="lazy" decoding="async">${x.s ? `<small>${esc(x.s)}</small>` : ''}</div>`
    : x.i
      ? `<div class="fnode ft"><img src="/assets/logos/${x.i}.svg" alt="" width="20" height="20" loading="lazy"><b>${esc(x.t)}</b></div>`
      : `<div class="fnode ft"><b>${esc(x.t)}</b>${x.s ? `<small>${esc(x.s)}</small>` : ''}</div>`;
  const lane = L => {
    const parts = [];
    L.steps.forEach((s, k) => {
      n += 1;
      parts.push(`<div class="fstep${s.wide ? ' wide' : ''}"${s.w ? ` style="flex-grow:${s.w}"` : ''}><p class="fh"><span class="fnum">${n}</span>${esc(s.h)}</p><div class="fnodes${s.n.length >= 4 ? ' two' : ''}">${s.n.map(node).join('')}</div><p class="fnote">${esc(s.note)}</p></div>`);
      if (k < L.steps.length - 1) parts.push(`<div class="farr${s.broken ? ' broken' : ''}" aria-hidden="true"><i></i></div>`);
    });
    return `<div class="flane">${L.label ? `<p class="flabel">${esc(L.label)}</p>` : ''}<div class="flow">${parts.join('')}</div>${L.back ? `<p class="fback"><span aria-hidden="true">↩</span> ${esc(L.back)}</p>` : ''}</div>`;
  };
  return `<p class="hw">${esc(h.w)}</p><p class="hy">${esc(h.y)}</p>
    <figure class="flowfig"><p class="flow-title">${esc(f.intro)}</p>${f.lanes.map(lane).join('')}<figcaption>${esc(f.foot)}</figcaption></figure>`;
}
export { S, G, by, url, ORDER };
