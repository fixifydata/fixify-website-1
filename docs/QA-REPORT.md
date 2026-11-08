# QA report

Run on 2026-11-08 against a local server (static files with Vercel-style clean URLs and the real `api/contact.js`), in headless Microsoft Edge 156. **Not tested against production**: Vercel headers/redirects, real email delivery and the live GTM container are called out below.

## Lighthouse (local, no CDN or compression, so production numbers may differ slightly)

| Page | Preset | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/` | mobile | 99 | 100 | 100 | 100 | 1.7 s | 0 | 0 ms |
| `/` | desktop | 100 | 100 | 100 | 100 | 0.6 s | 0.001 | 0 ms |
| `/privacy-policy` | mobile | 100 | 100 | 100 | 100 | 1.4 s | 0.004 | 0 ms |
| `/cookie-policy` | mobile | 100 | 100 | 100 | 100 | 1.4 s | 0.006 | 0 ms |

Notes: the first desktop run scored Performance 89 because the cookie banner resized when the web fonts arrived (CLS 0.23). The banner now waits for fonts, which fixed it. Lighthouse needed a small `URL.parse` shim to run under Node 21; that affects the tool, not the site.

## Form: end to end

Tested on a 1280px desktop and a 390px mobile viewport (touch emulation). **Passed on both**:

- Step 1 "Next" blocks with an error if nothing is picked; step label reads "Step 1 of 2" then "Step 2 of 2".
- Submitting step 2 empty shows inline errors for name, email, message and consent, and moves focus to the first invalid field.
- A valid submission reaches `/api/contact`, which forwards a lead containing company, website (normalised to `https://acme.com`), areas, stage and the consent flag to the webhook. The thank-you message appears, is focused and says what happens next.
- The honeypot field returns success but stores nothing. A request without consent or message is rejected with HTTP 400.

**Not verified:** actual email arriving at admin@fixifydata.xyz. The webhook in this test was a local stand-in for the Google Apps Script. Email delivery depends on the Vercel env vars and the redeployed Apps Script (see `REPLACE-BEFORE-LAUNCH.md`). Please send one real test submission after deploying.

## Consent and analytics

65 automated checks passed (0 failures); see `TRACKING-PLAN.md` for the detail. Highlights: no GTM request and no events before consent; Reject keeps it that way and is remembered; Accept loads GTM once; every event fires once per action; withdrawing consent stops events.

## Initial HTML (what crawlers get without running JavaScript)

Fetched the raw response of `/` and confirmed it contains: the 24-platform carousel list, all six problem tabs and service panels, the Plan/Build/Support section, sectors, all 8 FAQ answers and the JSON-LD. The only things JavaScript adds are interactions (tabs, form steps, banner). No "audit", "FixifyData", "Book a free", "See what we fix", "See how we fix" or "Start with step 1" appears in the page. FAQ JSON-LD was compared to the visible FAQ and matches exactly. One H1, no skipped heading levels, every image has an `alt` attribute. **Google Search Console URL Inspection was not run** (needs the deployed site).

## Links and layout

- 159 links and assets checked across `/`, `/privacy-policy`, `/cookie-policy` and the 404 page: no broken anchors or missing files. (The three canonical URLs point at the live domain by design.)
- No horizontal scroll at 320, 375, 390, 768, 1024 and 1440px.
- No tap target under 44px at those widths (nav links and logo were fixed during QA).
- Mobile sticky "Let’s talk" bar hides while the contact section is on screen and while the cookie banner is open; the page has bottom padding so it never covers content.

## Screenshots

In `docs/qa/` (WebP): mobile hero with cookie banner, mobile menu, platforms and "What working looks like", form step 2, 404; desktop services, involved, cookie preferences, contact.

## Known limits

- Platform logos: the carousel uses 22 supplied images; dbt has no logo yet. There is no pause button, by request.
- `/privacy-policy` and `/cookie-policy` resolve without a trailing slash (`cleanUrls` is on); canonical URLs and the sitemap use that form.
- Legal pages are drafts and carry visible placeholders by design.
