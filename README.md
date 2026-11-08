# Fixify website

Single-page site for **fixifydata.xyz**. Plain HTML/CSS/JS (no build step) plus one Vercel serverless function for the contact form.

```
index.html          homepage: all content in the initial HTML, SEO meta, one JSON-LD @graph
styles.css          theme + responsive layout
main.js             tabs, two-step form, mobile bar, analytics events
consent.js          cookie banner, Consent Mode v2, loads GTM only after consent
api/contact.js      POST /api/contact -> saves each lead to Google Sheets
apps-script/        Code.gs for the Google Sheet (stores leads, emails admin)
privacy-policy/     draft privacy policy (needs legal review)
cookie-policy/      draft cookie policy (needs legal review)
404.html            not-found page
assets/             logos (WebP + PNG), favicons, social card, assets/logos/*.svg platform marks
docs/               tracking plan, text changes, QA report, REPLACE-BEFORE-LAUNCH list
robots.txt, sitemap.xml, site.webmanifest, vercel.json
```

**Before launch, read [docs/REPLACE-BEFORE-LAUNCH.md](docs/REPLACE-BEFORE-LAUNCH.md).**

## Deploy (Vercel)

1. Import the GitHub repo in Vercel. Framework preset: **Other**. No build command.
2. Add environment variables, then redeploy:
   - `SHEETS_WEBHOOK_URL`: the Apps Script web app URL (ends in `/exec`)
   - `SHEETS_SECRET`: the same long random string as `SECRET` in `apps-script/Code.gs`
3. Domains: add `fixifydata.xyz` and `www.fixifydata.xyz`. `vercel.json` 301-redirects `www` and the preview domain `fixify-self.vercel.app` to `https://fixifydata.xyz`.

### Google Sheet for leads
Each submission is added as a row, and an email goes to admin@fixifydata.xyz.
1. Open the sheet > Extensions > Apps Script, paste in `apps-script/Code.gs`.
2. Set `SECRET` to a long random string.
3. Deploy > New deployment > Web app (Execute as **Me**, access **Anyone**). Copy the URL.
4. After changing the script later: Deploy > Manage deployments > Edit > Version: **New version**.
5. The sheet needs two extra headings, `Company` and `Consent`, in K1 and L1.

## Analytics and consent

GTM (`GTM-WX7FZ79N`) loads **only after a visitor accepts analytics**. Consent Mode v2 defaults are all denied. Events and the GTM setup are in [docs/TRACKING-PLAN.md](docs/TRACKING-PLAN.md).

## Editing notes

- The platform carousel and the FAQ are plain HTML in `index.html`. If you edit the FAQ, update the `FAQPage` JSON-LD in the `<head>` to match word for word.
- Service links all go to `#services` for now (`TODO: link to service pages when built`).
- Team and Proof sections are commented out in `index.html` until real material exists.
- Platform logos: add an official SVG as `assets/logos/<id>.svg` and swap the two-letter tile for an `<img>`.

## After launch
- Search Console: verify the domain, submit `https://fixifydata.xyz/sitemap.xml`, run URL Inspection on `/`.
- Send one real test form submission and confirm it arrives at admin@fixifydata.xyz.
