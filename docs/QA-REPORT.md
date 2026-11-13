# QA report

Run on 2026-11-12 against a local server (static files with Vercel-style clean URLs and the real `api/contact.js`), in headless Microsoft Edge 156. **Not tested against production**: Vercel headers and redirects, real email delivery and the live GTM container are called out below.

## Lighthouse (local, no CDN or compression, so production numbers may differ slightly)

| Page | Preset | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| `/` | mobile | 98 | 100 | 100 | 100 | 1.8 s | 100 ms | 0 |
| `/` | desktop | 100 | 100 | 100 | 100 | 0.6 s | 0 ms | 0.001 |
| `/services/consent-and-privacy` | mobile | 99 | 100 | 100 | 100 | 1.8 s | 0 ms | 0 |
| `/services/consent-and-privacy` | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 ms | 0.001 |
| `/services/ad-platforms` | mobile | 99 | 100 | 100 | 100 | 1.8 s | 0 ms | 0 |
| `/services/data-and-reporting` | mobile | 99 | 100 | 100 | 100 | 1.9 s | 10 ms | 0 |
| `/services/analytics-and-tags` | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 ms | 0.001 |

The earlier single-page build also scored 100 on both legal pages. Lighthouse needs a small `URL.parse` shim to run under Node 21; that affects the tool, not the site.

## Automated checks

- **Pages (132 checks, 0 failures)** across the homepage, all 7 service pages and both policy pages: status 200, no console errors or failed requests, one H1, no skipped heading levels, valid JSON-LD, title 60 characters or fewer, canonical set, images have alt text, no "audit" or retired button labels, header nav reads How it works / Sectors / FAQ.
- **Header:** the Services dropdown opens on click, lists the 7 services plus "All services", marks the current page, closes with Escape and outside click. Mobile menu opens, the Services accordion opens, the sticky bar hides while the menu is open, and a chosen service loads.
- **Service diagrams:** all seven flow diagrams render with every logo image loading (0 broken images), stack with downward arrows on mobile, and describe each step in plain English.
- **Logo bar:** 22 logos plus an `aria-hidden` duplicate, every logo displayed at the same size (160×44) from files of the same resolution (400×110), heading "Tools we work with", no pause button.
- **Service CTAs:** "Let’s talk" on a service page lands on `/?area=<service>#contact` with that area ticked in the form.
- **Form, consent and analytics (65 checks, 0 failures)** on desktop and a 390px mobile viewport: inline validation, thank-you state, webhook payload, honeypot; no GTM and no events before consent; each event fires once per action; withdrawing consent stops events.
- **Links and layout:** 705 links and assets checked across the homepage, service pages, policy pages and 404: nothing broken (the canonical URLs point at the live domain by design). No horizontal scroll at 320, 375, 390, 768, 1024 and 1440px. No tap target under 44px.

Issues found and fixed during this round: the Services dropdown closed itself when clicked on desktop (hover opens it, then the click toggled it shut); the sticky bar covered the bottom of the open mobile menu; the longer service names in the form caused a 1px sideways overflow at 320px; the old generic diagrams were replaced with a logo-based flow per service. Every diagram image loads on all seven pages and the flows stack with downward arrows on mobile.

## 3D service visuals (2026-11-14)

- **Seven distinct real-time 3D scenes** (Three.js r170, self-hosted, 716 KB minified / ~190 KB gzipped), one per service page hero. Physically based materials, studio lighting with reflections, soft shadows on a glossy stage, animated data packets, and labels that track the 3D objects.
- **Loading:** a still poster (1200 px, plus a 700 px phone variant, 30–85 KB WebP) shows at once and is the image Lighthouse measures for LCP. The 3D bundle is requested only after a real gesture: scroll past 40 px, wheel, tap, click, key, or sustained mouse movement. There is no timer, so a visitor who never interacts keeps the poster and pays none of the cost. It is never loaded for reduced motion or Data Saver. Shaders compile asynchronously before the scene fades in.
- **Fallbacks:** no WebGL keeps the poster; a frame-rate governor drops resolution if the device is slow and returns to the poster if it is still slow; the loop pauses when the visual is off screen or the tab is hidden.
- **Automated checks, 17/17 passed** (desktop 1366 px and mobile 390 px): poster loads, no 3D bundle before interaction, live scene starts after interaction, WebGL context healthy, frames differ over time (the animation is time-driven), canvas matches its box, labels placed, no console errors; reduced motion never loads the bundle.
- **Two performance problems found and fixed in this round.** The WebGL support check created a throwaway context during page load (a 470 ms long task on a throttled phone); it is gone, and mounting simply fails over to the poster if WebGL is missing. More seriously, a 4.5-second timer started the scene even for visitors who never interacted: on the desktop preset that produced a total blocking time of **9,960 ms and a score of 67**. With the timer removed, the same page measures **98 with 100 ms**.
- **One intermittent test result** was traced to the browser restoring a previous scroll position on reload, which fires real scroll events and legitimately starts the scene. The test now loads each page fresh; the site behaviour is correct.
- **Not verified:** real-GPU frame rate. The test browser renders WebGL in software, which renders each frame in 3–15 ms but presents frames slowly, so smoothness on real phones and laptops must be checked by eye before launch.
- The page and form suites still pass (132/132 and 65/65), and links and layout are clean at 320–1440 px.

## Regression found after the 3D round (fixed)

The two-step contact form was showing **both steps at once**. The flow-diagram step cards added earlier used the class name `.fstep`, which the form's two fieldsets already used; the diagram rule set `display:flex`, which overrides the browser's `hidden` behaviour, so step 2 never hid. The earlier form tests checked the `hidden` attribute rather than whether the element was actually invisible, so they passed while the page was wrong.

Fixed by renaming the diagram class to `.fl-step` (no visible change to the service pages) and adding `[hidden]{display:none!important}` as a safety net. The form suite now asserts computed `display` before and after "Next", so this cannot regress silently again: 69 checks, 0 failures.

## Not verified

- **Email delivery** to admin@fixifydata.xyz. The webhook in these tests was a local stand-in for the Google Apps Script. Send one real test submission after deploying (see `REPLACE-BEFORE-LAUNCH.md`).
- **The live GTM container** (the GA4 tag and triggers still have to be created; see `TRACKING-PLAN.md`).
- **Google Search Console URL Inspection** (needs the deployed site).
- **Vercel behaviour** for the new `/services/<name>` routes, the preview-domain redirect and clean-URL redirects.

## Screenshots

In `docs/qa/` (WebP): desktop logo bar, Services dropdown, homepage "What we do" with logos, service page top, service page flow diagram, full service page; mobile logo bar, mobile service page, mobile menu with the Services accordion open.

## Known limits

- The logo bar uses 22 of the supplied images. Server-side GTM, WooCommerce, BigCommerce and "Headless" have no supplied logo and appear as a small icon or text in the service sections.
- There is no pause button on the logo bar (removed on request). It still pauses on hover and keyboard focus and stops for visitors who prefer reduced motion. WCAG 2.2.2 expects a pause control for movement longer than 5 seconds.
- Pages resolve without a trailing slash (`cleanUrls` is on); canonical URLs and the sitemap use that form.
- Legal pages are drafts and carry visible placeholders by design.
