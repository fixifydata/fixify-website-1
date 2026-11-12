import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { head, header, footer, scripts, esc, S, by, url, ORDER, flow, chips } from './shell.mjs';
import { P2, F, SLUG } from './data.mjs';
const REPO = fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/, '');
const wrap = (hd, hdr, main, extra) => `${hd}\n<body>\n${hdr}\n${main}\n${footer()}\n${scripts(extra || '')}\n</body>\n</html>\n`;
const draft = `    <p class="draft">[Have a lawyer review before launch.] This is a plain-English draft, not legal advice.</p>`;

const privacy = `    <h1>Privacy policy</h1>
    <p>Last updated: [DATE]</p>
${draft}
    <p>This policy explains what personal data Fixify collects through this website, why, and what your rights are. We’ve tried to keep it plain.</p>

    <h2>Who we are</h2>
    <p>Fixify is an analytics and tracking consultancy. The organisation responsible for your data (the “controller”) is [LEGAL ENTITY NAME, REGISTRATION NUMBER], [LOCATION]. You can contact us at <a href="mailto:admin@fixifydata.xyz">admin@fixifydata.xyz</a>.</p>

    <h2>What we collect</h2>
    <ul>
      <li><b>Contact form.</b> Your name, work email, company, website, the areas you picked, where you are today, your message, and your agreement to this policy.</li>
      <li><b>Where you came from.</b> With the form we also record the page you landed on, the site that referred you, and campaign tags in the link (for example utm_source), so we know which channels work.</li>
      <li><b>Technical details sent with the form.</b> Your browser type and your country (worked out from your IP address by our host). We don’t store your full IP address.</li>
      <li><b>Analytics (only if you accept).</b> If you accept analytics cookies, we measure page views, clicks, form steps and how far you scroll, using Google Tag Manager and Google Analytics. If you reject, none of this runs.</li>
      <li><b>Your cookie choice.</b> Stored in your browser so we don’t ask every visit.</li>
      <li><b>Email.</b> If you email us, we keep the message and your address.</li>
    </ul>

    <h2>Why we use it, and our legal basis</h2>
    <ul>
      <li>To reply to you and discuss a possible project: our legitimate interest in answering enquiries, and steps you ask us to take before a contract.</li>
      <li>To understand which channels and pages work: your consent (analytics only).</li>
      <li>To keep the site secure and stop spam: our legitimate interest.</li>
    </ul>
    <p>We don’t sell your data. We don’t send newsletters from the contact form.</p>

    <h2>Who processes it for us</h2>
    <ul>
      <li><b>Vercel</b>: website hosting and the function that receives the form.</li>
      <li><b>Google</b>: stores form submissions in Google Sheets and sends us the notification email; provides Google Tag Manager and Google Analytics if you accept analytics; serves the fonts used on this site, which means your browser contacts Google’s font servers when a page loads.</li>
    </ul>
    <p>Some of these providers are based outside the UK and EU. Where that happens, they rely on safeguards such as standard contractual clauses or an adequacy decision. [Confirm the transfer mechanism for each provider.]</p>

    <h2>How long we keep it</h2>
    <p>Enquiries that don’t become a project: [X months]. Client records: [X years]. Analytics data: [X months]. We then delete or anonymise it.</p>

    <h2>Your rights</h2>
    <p>Depending on where you live, you can ask us to access, correct, delete or export your data, to restrict or object to how we use it, and to withdraw consent at any time (use “Cookie settings” in the footer). To use any of these rights, email <a href="mailto:admin@fixifydata.xyz">admin@fixifydata.xyz</a>. You can also complain to your data protection authority, for example the ICO in the UK.</p>

    <h2>Changes</h2>
    <p>If we change this policy, we’ll update the date above.</p>

    <h2>Contact</h2>
    <p><a href="mailto:admin@fixifydata.xyz">admin@fixifydata.xyz</a></p>`;

const cookie = `    <h1>Cookie policy</h1>
    <p>Last updated: [DATE]</p>
${draft}
    <p>Cookies are small files a website stores in your browser. Similar technologies, such as local storage, do the same job. This page lists what Fixify’s site uses.</p>

    <h2>How we use them</h2>
    <p>The site works without analytics. We switch analytics on only if you choose “Accept” in the banner or turn on “Analytics” under “Preferences”. Until then, Google Tag Manager isn’t loaded and Google’s consent settings stay denied. We run no advertising on this site, so advertising storage stays denied.</p>

    <h2>What’s on this site</h2>
    <div class="legal-table"><table>
      <thead><tr><th>Name</th><th>Type</th><th>Purpose</th><th>Lifetime</th></tr></thead>
      <tbody>
        <tr><td>fixify_consent_v1</td><td>Necessary (browser local storage)</td><td>Remembers your cookie choice.</td><td>Until you clear your browser data</td></tr>
        <tr><td>_ga, _ga_*</td><td>Analytics (only if accepted)</td><td>Google Analytics: tells visits apart and measures page views and clicks.</td><td>Up to 2 years [confirm against the GTM/GA4 configuration]</td></tr>
      </tbody>
    </table></div>

    <h2>Change or withdraw your choice</h2>
    <p>Use <button type="button" class="linklike" data-cookie-settings style="color:var(--navy);font-weight:600;text-decoration:underline">Cookie settings</button> here or in the footer of any page. If you withdraw consent, we stop analytics and remove the Google Analytics cookies we can reach. You can also delete cookies in your browser settings.</p>

    <h2>More information</h2>
    <p>See our <a href="/privacy-policy">privacy policy</a> for how we handle personal data, or email <a href="mailto:admin@fixifydata.xyz">admin@fixifydata.xyz</a>.</p>`;


const legal = (title, desc, path, body) => wrap(head({ title, desc, path }), header(), `<main id="main" class="legal">\n  <div class="wrap">\n${body}\n  </div>\n</main>`);
fs.mkdirSync(REPO + '/privacy-policy', { recursive: true });
fs.mkdirSync(REPO + '/cookie-policy', { recursive: true });
fs.writeFileSync(REPO + '/privacy-policy/index.html', legal('Privacy policy | Fixify', 'How Fixify collects, uses and protects personal data on this website, and your rights.', '/privacy-policy', privacy));
fs.writeFileSync(REPO + '/cookie-policy/index.html', legal('Cookie policy | Fixify', 'The cookies and similar technologies used on the Fixify website, and how to change your choice.', '/cookie-policy', cookie));
fs.writeFileSync(REPO + '/404.html', wrap(head({ title: 'Page not found | Fixify', desc: 'This page could not be found.', robots: 'noindex' }), header(), `<main id="main" class="nf">
  <div>
    <h1>This page isn’t tracked yet.</h1>
    <p>The link may be old or mistyped. Everything we do is on the home page, or you can pick a service.</p>
    <p class="nf-actions"><a class="btn btn-gold btn-lg" href="/">Go to the home page</a> <a class="btn btn-ghost btn-lg" href="/#contact">Let’s talk</a></p>
  </div>
</main>`));

// ---------- service pages ----------
const li = a => a.map(x => `<li>${x}</li>`).join('');
function servicePage(id) {
  const s = by(id), d = P2[id], k = ORDER.indexOf(id), rel = [ORDER[(k + 1) % 7], ORDER[(k + 2) % 7]];
  const faqs = F[id].concat(d.f), path = url(id);
  const ld = `<script type="application/ld+json">\n` + JSON.stringify({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://fixifydata.xyz/' }, { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://fixifydata.xyz/#services' }, { '@type': 'ListItem', position: 3, name: s[1], item: 'https://fixifydata.xyz' + path }] },
    { '@type': 'Service', name: s[1], description: s[3], serviceType: s[1], url: 'https://fixifydata.xyz' + path, provider: { '@type': 'ProfessionalService', name: 'Fixify', url: 'https://fixifydata.xyz/', email: 'admin@fixifydata.xyz' } },
    { '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] }, null, 2) + `\n</script>`;
  const main = `<main id="main" class="svc-page">
<section class="page-hero">
  <div class="wrap">
    <nav class="crumb" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/#services">Services</a> <span aria-hidden="true">/</span> <span aria-current="page">${esc(s[1])}</span></nav>
    <p class="eyebrow">${esc(s[1])}</p>
    <h1>${esc(s[2])}.</h1>
    <p class="lede">${esc(s[3])}</p>
    <div class="hero-actions"><a href="/?area=${id}#contact" class="btn btn-gold btn-lg" data-cta="service_page_hero">Let’s talk</a></div>
    <ul class="pill-list"><li>Best for ${esc(d.b)}</li><li>Read-only access to start</li><li>Your accounts stay yours</li></ul>
  </div>
</section>

<section class="sec" aria-labelledby="h-what">
  <div class="wrap"><h2 id="h-what" class="h2">What it is, and why it matters.</h2>${flow(id)}</div>
</section>

<section class="sec alt" aria-labelledby="h-familiar">
  <div class="wrap"><h2 id="h-familiar" class="h2">Sound familiar?</h2>
    <div class="problem-grid two">${d.p.map(x => `<article class="problem"><p class="say">${esc(x[0])}</p><p class="deliver"><strong>We deliver</strong>${esc(x[1])}</p></article>`).join('')}</div>
  </div>
</section>

<section class="sec" aria-labelledby="h-do">
  <div class="wrap"><h2 id="h-do" class="h2">What we do.</h2>
    <div class="pgrid">${d.c.map(x => `<article class="pcard"><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></article>`).join('')}</div>
  </div>
</section>

<section class="sec alt" aria-labelledby="h-get">
  <div class="wrap"><h2 id="h-get" class="h2">What you get.</h2>
    <div class="panel-card"><ul class="ticks two-col">${li(s[4].concat(['Test evidence for key journeys', 'A handover session for your team']))}</ul></div>
  </div>
</section>

<section class="sec" aria-labelledby="h-plat">
  <div class="wrap"><h2 id="h-plat" class="h2">Platforms.</h2>
    ${chips(s[5])}
    <p class="platform-more">Don’t see yours? <a href="/#contact" data-cta="service_page_platforms">Let’s talk.</a></p>
  </div>
</section>

<section class="sec alt" aria-labelledby="h-how">
  <div class="wrap"><h2 id="h-how" class="h2">How we work.</h2>
    <ol class="steps">${d.st.map((x, n) => `<li><span class="step-n">${n + 1}</span><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></li>`).join('')}</ol>
  </div>
</section>

<section class="sec" aria-labelledby="h-look">
  <div class="wrap"><h2 id="h-look" class="h2">What it looks like.</h2>
    <div class="panel-card"><p class="ill-tag">Illustrative example, not a client result</p><p class="ill-body">${esc(d.ex)}</p></div>
  </div>
</section>

<section class="sec alt" aria-labelledby="h-need">
  <div class="wrap"><h2 id="h-need" class="h2">What we need from you.</h2>
    <div class="panel-card"><ul class="ticks">${li(d.n)}</ul></div>
  </div>
</section>

<section class="sec" aria-labelledby="h-faq">
  <div class="wrap"><h2 id="h-faq" class="h2">Questions.</h2>
    <div class="faq-list narrow">${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
  </div>
</section>

<section class="sec alt" aria-labelledby="h-rel">
  <div class="wrap"><h2 id="h-rel" class="h2">Related.</h2>
    <ul class="related">${rel.map(r => `<li><a href="${url(r)}"><b>${esc(by(r)[1])}</b><span>${esc(by(r)[2])}</span></a></li>`).join('')}<li><a href="/#services"><b>All services</b><span>See everything we do</span></a></li></ul>
    <div class="band"><h2>Tell us what you’re trying to fix.</h2><a class="btn btn-gold btn-lg" href="/?area=${id}#contact" data-cta="service_page_band">Let’s talk</a></div>
  </div>
</section>
</main>`;
  fs.mkdirSync(REPO + path, { recursive: true });
  fs.writeFileSync(REPO + path + '/index.html', wrap(head({ title: `${s[1]} | Fixify`, desc: `${s[3]} Fixify: analytics and tracking consultants.`.slice(0, 155), path, ld }), header(id), main));
}
ORDER.forEach(servicePage);
console.log('pages written');
