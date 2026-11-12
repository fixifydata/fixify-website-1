# QA report

Run on 2026-11-12 against a local server (static files with Vercel-style clean URLs and the real `api/contact.js`), in headless Microsoft Edge 156. **Not tested against production**: Vercel headers and redirects, real email delivery and the live GTM container are called out below.

## Lighthouse (local, no CDN or compression, so production numbers may differ slightly)

| Page | Preset | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|---|
| `/` | mobile | 98 | 100 | 100 | 100 | 1.8 s | 0 |
| `/` | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0.001 |
| `/services/ad-platforms` | mobile | 99 | 100 | 100 | 100 | 1.6 s | 0 |
| `/services/consent-and-privacy` | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0.011 |

The earlier single-page build also scored 100 on both legal pages. Lighthouse needs a small `URL.parse` shim to run under Node 21; that affects the tool, not the site.

## Automated checks

- **Pages (132 checks, 0 failures)** across the homepage, all 7 service pages and both policy pages: status 200, no console errors or failed requests, one H1, no skipped heading levels, valid JSON-LD, title 60 characters or fewer, canonical set, images have alt text, no "audit" or retired button labels, header nav reads How it works / Sectors / FAQ.
- **Header:** the Services dropdown opens on click, lists the 7 services plus "All services", marks the current page, closes with Escape and outside click. Mobile menu opens, the Services accordion opens, the sticky bar hides while the menu is open, and a chosen service loads.
- **Logo bar:** 22 logos plus an `aria-hidden` duplicate, every logo displayed at the same size (160×44) from files of the same resolution (400×110), heading "Tools we work with", no pause button.
- **Service CTAs:** "Let’s talk" on a service page lands on `/?area=<service>#contact` with that area ticked in the form.
- **Form, consent and analytics (65 checks, 0 failures)** on desktop and a 390px mobile viewport: inline validation, thank-you state, webhook payload, honeypot; no GTM and no events before consent; each event fires once per action; withdrawing consent stops events.
- **Links and layout:** 705 links and assets checked across the homepage, service pages, policy pages and 404: nothing broken (the canonical URLs point at the live domain by design). No horizontal scroll at 320, 375, 390, 768, 1024 and 1440px. No tap target under 44px.

Issues found and fixed during this round: the Services dropdown closed itself when clicked on desktop (hover opens it, then the click toggled it shut); the sticky bar covered the bottom of the open mobile menu; the longer service names in the form caused a 1px sideways overflow at 320px; the centre label in the hub diagrams overflowed its box and the animated dots drew over it.

## Not verified

- **Email delivery** to admin@fixifydata.xyz. The webhook in these tests was a local stand-in for the Google Apps Script. Send one real test submission after deploying (see `REPLACE-BEFORE-LAUNCH.md`).
- **The live GTM container** (the GA4 tag and triggers still have to be created; see `TRACKING-PLAN.md`).
- **Google Search Console URL Inspection** (needs the deployed site).
- **Vercel behaviour** for the new `/services/<name>` routes, the preview-domain redirect and clean-URL redirects.

## Screenshots

In `docs/qa/` (WebP): desktop logo bar, Services dropdown, homepage "What we do" with logos, service page top, service page visual (hub diagram), full service page; mobile logo bar, mobile service page, mobile menu with the Services accordion open.

## Known limits

- The logo bar uses the 22 images supplied. dbt and Server-side GTM have no supplied logo, so they appear as text chips in the service sections only.
- There is no pause button on the logo bar (removed on request). It still pauses on hover and keyboard focus and stops for visitors who prefer reduced motion. WCAG 2.2.2 expects a pause control for movement longer than 5 seconds.
- Pages resolve without a trailing slash (`cleanUrls` is on); canonical URLs and the sitemap use that form.
- Legal pages are drafts and carry visible placeholders by design.
