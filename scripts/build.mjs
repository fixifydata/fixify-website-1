import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { esc, header, footer, scripts, toolsBar, chips, S, by, url, ORDER } from './shell.mjs';
import { HOME, TAB } from './data.mjs';
const SP = fileURLToPath(new URL('.', import.meta.url));
const REPO = fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/, '');

const FAQ = [
  ['Why don’t my GA4 numbers match Google Ads, Meta or my store orders?', 'Every platform counts differently: attribution models, time zones, consent, ad blockers, duplicate tags and missing events all create gaps. We trace each difference to its cause, fix what is broken and document what is expected, so you know which number to trust for which decision.'],
  ['Do I need server-side tracking?', 'If you spend meaningfully on paid media, lose data to browser restrictions or need more control over what data leaves your site, server-side GTM and Conversion APIs usually pay for themselves. If your browser tracking is still broken, we fix that first.'],
  ['Is my consent banner actually blocking tags?', 'Often not. We test what fires before and after each consent choice, configure Google Consent Mode v2 and your CMP, and give you evidence that tags respect your visitors’ choices. We implement technical measurement. Please confirm legal requirements with your own counsel.'],
  ['Can you track mobile apps as well as websites?', 'Yes. We implement and fix Firebase / GA4 for apps, AppsFlyer, Amplitude, Mixpanel and PostHog, and connect app and web data so journeys are measured end to end.'],
  ['Do you work with companies outside my country?', 'Yes. We work remotely with teams across Europe, the UK, North America, the Middle East, India and Asia-Pacific, and schedule calls in your time zone.'],
  ['Do we have to give you ownership of our accounts?', 'No. We work through user access you grant and can remove at any time. Your GA4, GTM, ad and data accounts always stay yours.'],
  ['What do you need from us to start?', 'A conversation about what’s wrong or missing, and read-only access. Edit access only for agreed changes.'],
  ['Will you rebuild everything?', 'No. We keep what works and recommend focused changes first.']
];
const faqHtml = FAQ.map(([q, a]) => `      <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n');
const faqLd = JSON.stringify({ '@type': 'FAQPage', '@id': 'https://fixifydata.xyz/#faq', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 2).replace(/\n/g, '\n    ');

const offers = S.map(s => `          {"@type":"Offer","itemOffered":{"@type":"Service","name":"${s[1]}","url":"https://fixifydata.xyz${url(s[0])}"}}`).join(',\n');

// ---- "When should you call us?" ----
const problems = `<!-- 5. WHEN SHOULD YOU CALL US -->
<section class="problems" id="problems" aria-labelledby="problems-title">
  <div class="wrap">
    <h2 id="problems-title" class="h2">When should you call us?</h2>
    <p class="section-lede">Usually when one of these starts to sound familiar. Pick your area.</p>

    <div class="area-tabs" role="tablist" aria-label="Problem areas" data-group="problems">
${ORDER.map((id, n) => `      <button role="tab" id="pt-${id}" aria-controls="pp-${id}" data-area="${id}" aria-selected="${n === 0}"${n ? ' tabindex="-1"' : ''}>${esc(TAB[id])}</button>`).join('\n')}
    </div>
${ORDER.map((id, n) => `
    <div class="problem-panel" role="tabpanel" id="pp-${id}" aria-labelledby="pt-${id}" data-area="${id}"${n ? ' hidden' : ''}>
      <div class="problem-grid">
${HOME[id].cards.map(([say, del]) => `        <article class="problem"><p class="say">${esc(say)}</p><p class="deliver"><strong>We deliver</strong>${esc(del)}</p></article>`).join('\n')}
      </div>
      <a class="qlink" href="${url(id)}">See what we do</a>
    </div>`).join('\n')}
  </div>
</section>`;

// ---- "What we do" ----
const services = `<!-- 6. WHAT WE DO + TOOLS -->
<section class="services" id="services" aria-labelledby="services-title">
  <div class="wrap">
    <h2 id="services-title" class="h2">What we do, and the tools we do it with.</h2>
    <p class="section-lede">Seven areas, one team. We know every platform below and recommend only the ones that fit your business.</p>

    <div class="svc">
      <div class="svc-list" role="tablist" aria-label="Services" aria-orientation="vertical" data-group="services">
${ORDER.map((id, n) => `        <button role="tab" id="st-${id}" aria-controls="sp-${id}" data-area="${id}" aria-selected="${n === 0}"${n ? ' tabindex="-1"' : ''}><span>${esc(by(id)[1])}</span><small>${esc(by(id)[2])}</small></button>`).join('\n')}
      </div>
${ORDER.map((id, n) => { const s = by(id), h = HOME[id]; return `
      <article class="svc-panel" role="tabpanel" id="sp-${id}" aria-labelledby="st-${id}"${n ? ' hidden' : ''}>
        <h3>${esc(s[1])}</h3>
        <p class="outcome">${esc(h.out)}</p>
        <p>${esc(h.para)}</p>
        <div class="svc-cols">
          <div><h4>You get</h4><ul class="ticks">${h.get.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div><h4>Tools</h4>${chips(s[5])}</div>
        </div>
        <div class="svc-actions">
          <a class="btn btn-navy" href="/?area=${id}#contact" data-pick="${id}" data-cta="service_${id}">Let’s talk</a>
          <a class="qlink" href="${url(id)}">Explore ${esc(s[1].toLowerCase())}</a>
        </div>
      </article>`; }).join('\n')}
    </div>
    <p class="platform-more">Don’t see your platform? <a href="#contact" data-cta="services_other">Ask us.</a></p>
  </div>
</section>`;

const picks = `<div class="pick-grid">
${ORDER.map(id => `          <label class="pick"><input type="checkbox" name="services" value="${esc(by(id)[1])}" data-key="${id}"><span>${esc(by(id)[1])}</span></label>`).join('\n')}
          <label class="pick pick-wide"><input type="checkbox" name="services" value="Not sure yet" data-key="unsure"><span>Not sure yet</span></label>
        </div>`;

let html = fs.readFileSync(SP + 'index.template.html', 'utf8');
html = html.replace('{{HEADER}}', header()).replace('{{TOOLS_BAR}}', toolsBar()).replace('{{PROBLEMS}}', problems).replace('{{SERVICES}}', services)
  .replace('{{PICKS}}', picks).replace('{{FOOTER}}', footer()).replace('{{SCRIPTS}}', scripts('\n<script src="/main.js" defer></script>'))
  .replace('{{OFFERS}}', offers).replace('{{FAQ_HTML}}', faqHtml).replace('{{FAQ_JSONLD}}', faqLd);
if (/\{\{/.test(html)) throw new Error('unresolved placeholder: ' + html.match(/\{\{[^}]*\}\}/)[0]);
fs.writeFileSync(REPO + '/index.html', html);
console.log('index.html written', html.length);
