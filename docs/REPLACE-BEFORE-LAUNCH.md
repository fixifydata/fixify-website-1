# REPLACE BEFORE LAUNCH

Everything below is unverified, or needs a decision from you. Nothing was invented. Where a fact was missing, the build uses the wording that was already on the old site, hides the block, or leaves a visible `[BRACKET]` (policy pages only).

## Decisions and facts only you can confirm

| # | Item | Where | Current state in the build |
|---|---|---|---|
| 1 | **Team members** (photo, name, role, one-line specialty, LinkedIn, verified certifications). Also "[X] years of combined experience" if you want to claim it | `index.html`, `#team` block | **Hidden** (inside an HTML comment, with a ready template). Nav and footer "Team" links are also commented out. Uncomment all three together when ready |
| 2 | **Proof**: client logos (with permission), 1–3 case studies with real before/after results, 1–2 testimonials with name, role, company | `index.html`, `#proof` block | **Hidden** (HTML comment). Nothing shown or implied |
| 3 | **Sectors**: keep only those with real experience | `#sectors` | All six from your brief are **shown**. Remove any you can't back up |
| 4 | **Regions served** | FAQ answer "Do you work with companies outside my country?" and JSON-LD `areaServed` | Uses the old site's list (Europe, UK, North America, Middle East, India, Asia-Pacific). Confirm or edit both places |
| 5 | **Call length and price** ("30 minutes, free") and **reply time** ("one business day") | How it works step 2, contact promises, thank-you message | Uses the old site's wording (free, 30 minutes, one business day). Confirm they're true |
| 6 | **LinkedIn company page** name and URL | contact section, footer, JSON-LD `sameAs` | URL unchanged (`/company/fixifydata`). Rename the page to "Fixify" on LinkedIn if you haven't, and change the slug if you get a new one |
| 7 | **Legal entity name, registration, location** | footer, privacy policy | Footer shows "© 2026 Fixify." only. Privacy policy has `[LEGAL ENTITY NAME, REGISTRATION NUMBER]` and `[LOCATION]` |
| 8 | **Spelling variant** [US/UK] | whole site | **UK** ("prioritised", "organisation"), as in your brief. `og:locale` is `en_GB` |
| 9 | **Booking calendar** | none | Not added. The word "Book" is not used anywhere. If you add a calendar embed, add `[CALENDAR LINK]` |

## Placeholders inside the legal drafts (both pages carry "[Have a lawyer review before launch.]")

- `/privacy-policy`: `[DATE]`, `[LEGAL ENTITY NAME, REGISTRATION NUMBER]`, `[LOCATION]`, retention periods (`[X months]`, `[X years]`, `[X months]`), international-transfer mechanism per provider.
- `/cookie-policy`: `[DATE]`, `_ga` lifetime to confirm against the real GTM/GA4 setup.
- Remove the yellow "draft" box on both pages once reviewed.

## Setup steps that can't be done from this repo

1. **Vercel env vars** `SHEETS_WEBHOOK_URL` and `SHEETS_SECRET` (the form returns an error without them, and shows an email fallback).
2. **Redeploy the Apps Script** (`apps-script/Code.gs` changed: adds Company and Consent columns, new email subject). Deploy > Manage deployments > Edit > New version. Add headings `Company` and `Consent` to cells K1 and L1 of the existing sheet.
3. **GTM container `GTM-WX7FZ79N`**: create the GA4 configuration tag and the event triggers listed in `docs/TRACKING-PLAN.md`. The site only pushes events; it cannot create container tags.
4. **Brand logos**: the sliding carousel uses the 22 logo images you supplied (`assets/logos/carousel/`), trimmed and converted to WebP. Still without a logo: **dbt** (text tile in the carousel) and **Server-side GTM** (small GTM icon plus text). The small tool chips inside the "What we do" panels still use icon marks where available and a two-letter tile for Adobe Launch, Usercentrics, Termly, Tableau, Tealium, Segment and others. Confirm you're allowed to show each vendor's logo, and swap in official files where you have them.
   - **Accessibility trade-off:** the carousel has no pause button (removed on request). It still pauses on hover and keyboard focus and stops for visitors who prefer reduced motion. WCAG 2.2.2 expects a pause control for movement over 5 seconds, so consider adding one back.
5. **Search Console**: verify the domain, submit the sitemap, run URL Inspection on `/`. The Vercel preview domain `fixify-self.vercel.app` now 301-redirects to the main domain (takes effect on deploy).
6. A stray empty folder `C:\c\` exists on the author's machine from a mistyped path during the build. It is outside the repo and can be deleted.
