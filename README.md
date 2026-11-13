# Fixify website

Multi-page site for **fixifydata.xyz**. Static HTML/CSS/JS plus one Vercel serverless function for the contact form. The page files are committed, so Vercel needs no build step.

```
index.html              homepage (all content in the initial HTML, one JSON-LD @graph)
services/<service>/     seven service pages (generated, see below)
privacy-policy/         draft privacy policy (needs legal review)
cookie-policy/          draft cookie policy (needs legal review)
404.html                not-found page
styles.css              theme + responsive layout
site.js                 every page: header menu + Services dropdown, mobile bar, analytics events
main.js                 homepage only: tabs, two-step form
consent.js              cookie banner, Consent Mode v2, loads GTM only after consent
api/contact.js          POST /api/contact -> saves each lead to Google Sheets
apps-script/            Code.gs for the Google Sheet (stores leads, emails admin)
scripts/                page generator (see "Editing content")
assets/                 logos, favicons, social card; assets/logos/carousel/ = tool logos
docs/                   tracking plan, text changes, QA report, REPLACE-BEFORE-LAUNCH list
robots.txt, sitemap.xml, site.webmanifest, vercel.json
```

**Before launch, read [docs/REPLACE-BEFORE-LAUNCH.md](docs/REPLACE-BEFORE-LAUNCH.md).**

## Editing content

The service pages, the homepage "When should you call us?" and "What we do" sections, the header dropdown, the footer and the legal pages are **generated** from `scripts/`, so a change is made once and appears everywhere.

| To change | Edit |
|---|---|
| Service copy, FAQs, diagrams, tool lists | `scripts/data.mjs` |
| Header, footer, logo bar, shared head tags | `scripts/shell.mjs` |
| Homepage text outside those sections | `scripts/index.template.html` |
| Privacy / cookie policy text | `scripts/build-pages.mjs` |

Then run (Node 18 or newer, no installs needed):

```
node scripts/build.mjs && node scripts/build-pages.mjs
```

and commit the regenerated files. Do not hand-edit `index.html` or the generated pages, or your changes will be overwritten the next time the generator runs.

- If you change a homepage FAQ, edit it in `scripts/build.mjs`. The `FAQPage` JSON-LD is built from the same list, so the two always match.
- Team and Proof sections are commented out in the homepage template until real material exists.
- Tool logos live in `assets/logos/carousel/<id>.webp`. All are 400×110 on white so they display at the same size. New logos must use the same canvas. Keep the platform name in the hidden text beside each logo so the names stay in the HTML.

## 3D service visuals

Each service page's hero is a real-time 3D scene (Three.js). Visitors see a still poster first; the live scene fades in after they scroll or interact, and is skipped for reduced motion, Data Saver, no WebGL, or slow devices.

```
scripts/scene3d/engine.js   renderer, lighting, stage, logo cards, glass pipes, data packets, labels
scripts/scene3d/scenes.js   the seven scenes (one function each)
scripts/scene3d/entry.js    mounts a scene, runs the loop, frame-rate governor
assets/js/scene3d.js        the built bundle the site loads (committed)
assets/scenes/<id>.webp     the still posters (committed)
```

To change a scene, from the `scripts/` folder: `npm install`, edit `scene3d/scenes.js`, then `npm run build:3d` (rebuilds the bundle) and `BROWSER="<path to Chrome or Edge>" npm run posters` (regenerates the stills). Commit the results, and bump the `?v=1` on the scene bundle and posters (in `site.js` and `scripts/build-pages.mjs`), because everything under `/assets/` is cached for a year. Logos used in the scenes are the 400x110 files in `assets/logos/carousel/`.

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

## After launch
- Search Console: verify the domain, submit `https://fixifydata.xyz/sitemap.xml`, run URL Inspection on `/` and a service page.
- Send one real test form submission and confirm it arrives at admin@fixifydata.xyz.
