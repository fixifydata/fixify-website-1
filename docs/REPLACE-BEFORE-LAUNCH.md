# REPLACE BEFORE LAUNCH

Everything below is unverified, or needs a decision from you. Nothing was invented. Where a fact was missing, the build uses the wording that was already on the old site, hides the block, or leaves a visible `[BRACKET]` (policy pages only).

## Decisions and facts only you can confirm

| # | Item | Where | Current state in the build |
|---|---|---|---|
| 1 | **Team members** (photo, name, role, one-line specialty, LinkedIn, verified certifications). Also "[X] years of combined experience" if you want to claim it | `scripts/index.template.html`, `#team` block | **Hidden** (inside an HTML comment, with a ready template). The header and footer "Team" links are also commented out (in `scripts/shell.mjs`). Restore all three together, then regenerate |
| 2 | **Proof**: client logos (with permission), 1–3 case studies with real before/after results, 1–2 testimonials | `scripts/index.template.html`, `#proof` block | **Hidden** (HTML comment). Nothing shown or implied |
| 3 | **Sectors**: keep only those with real experience | `#sectors` | All six from your brief are **shown**. Remove any you can't back up |
| 4 | **Regions served** | FAQ answer "Do you work with companies outside my country?" and JSON-LD `areaServed` | Uses the old site's list (Europe, UK, North America, Middle East, India, Asia-Pacific). Confirm or edit both places |
| 5 | **Call length and price** ("30 minutes, free") and **reply time** ("one business day") | How it works step 2, contact promises, thank-you message | Uses the old site's wording. Confirm they're true |
| 6 | **LinkedIn company page** name and URL | contact section, footer, JSON-LD `sameAs` | URL unchanged (`/company/fixifydata`). Rename the page to "Fixify" on LinkedIn if you haven't |
| 7 | **Legal entity name, registration, location** | footer, privacy policy | Footer shows "© 2026 Fixify." only. Privacy policy has `[LEGAL ENTITY NAME, REGISTRATION NUMBER]` and `[LOCATION]` |
| 8 | **Spelling variant** [US/UK] | whole site | **UK** ("prioritised", "organisation"). `og:locale` is `en_GB` |
| 9 | **Booking calendar** | none | Not added. The word "Book" is not used. If you add a calendar embed, add `[CALENDAR LINK]` |
| 10 | **Seventh service, "Ad platforms"**, and its claims, including "We focus on measurement and work with your team or agency" (we don't manage ad spend) | `/services/ad-platforms`, homepage | Taken from your prototype. Confirm the scope is right |
| 11 | **Service page content** (the "Sound familiar?" problems, "What we do" cards, FAQs, "What we need from you") | `scripts/data.mjs` | Taken from your prototype, not independently checked. Read each page |
| 12 | **"What it looks like" examples** on each service page | service pages | Clearly labelled "Illustrative example, not a client result". Replace each with a real, permitted case when you have one |
| 13 | **Typical timing** ("X–Y weeks") shown in your prototype | service pages | **Left out**, because no real figure was given. Add one per service if you want it |
| 14 | **Header: Resources and About** (shown in your prototype) | header | **Left out.** There are no real guides or team yet, and a link to an empty page would be a placeholder. The header is Services, How it works, Sectors, FAQ, Let's talk. Say the word and I'll add them when content exists |
| 15 | **Contact email**: your prototype shows hello@fixifydata.xyz, the live site and brief use admin@fixifydata.xyz | everywhere | **admin@fixifydata.xyz** is used throughout. Change in `scripts/shell.mjs`, `scripts/index.template.html`, `api/contact.js` and `apps-script/Code.gs` if you prefer hello@ |

## Placeholders inside the legal drafts (both pages carry "[Have a lawyer review before launch.]")

- `/privacy-policy`: `[DATE]`, `[LEGAL ENTITY NAME, REGISTRATION NUMBER]`, `[LOCATION]`, retention periods (`[X months]`, `[X years]`, `[X months]`), international-transfer mechanism per provider.
- `/cookie-policy`: `[DATE]`, `_ga` lifetime to confirm against the real GTM/GA4 setup.
- Remove the yellow "draft" box on both pages once reviewed.

## Setup steps that can't be done from this repo

1. **Vercel env vars** `SHEETS_WEBHOOK_URL` and `SHEETS_SECRET` (the form returns an error without them, and shows an email fallback).
2. **Redeploy the Apps Script** (`apps-script/Code.gs` changed: adds Company and Consent columns, new email subject). Deploy > Manage deployments > Edit > New version. Add headings `Company` and `Consent` to cells K1 and L1 of the existing sheet.
3. **GTM container `GTM-WX7FZ79N`**: create the GA4 configuration tag and the event triggers listed in `docs/TRACKING-PLAN.md`. The site only pushes events; it cannot create container tags.
4. **Brand logos.** The logo bar, the tool chips and the service-page diagrams use the 29 logo images you supplied (`assets/logos/carousel/`), all normalised to the same size. Still without a supplied logo, so shown as text or a small icon: Server-side GTM, WooCommerce, BigCommerce and "Headless" (not a product). The Adobe logo is the company logo and is used for Adobe Launch. dbt has been removed everywhere. Confirm you may show each vendor's logo.
   - To add a logo, put it on a 400×110 white canvas as `assets/logos/carousel/<id>.webp` and add it to the lists in `scripts/shell.mjs`.
   - **Accessibility trade-off:** the logo bar has no pause button (removed on request). It still pauses on hover and keyboard focus and stops for visitors who prefer reduced motion. WCAG 2.2.2 expects a pause control for movement over 5 seconds, so consider adding one back.
5. **Search Console**: verify the domain, submit the sitemap, run URL Inspection on `/` and a service page. The Vercel preview domain `fixify-self.vercel.app` now 301-redirects to the main domain (takes effect on deploy).
6. A stray empty folder `C:\c\` exists on the author's machine from a mistyped path during the build. It is outside the repo and can be deleted.
