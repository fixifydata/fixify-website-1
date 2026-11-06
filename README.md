# FixifyData website

Single-page site for **fixifydata.xyz**. Plain HTML/CSS/JS (no build step) plus one Vercel serverless function for the contact form.

```
index.html        page content, SEO meta, JSON-LD schema, GTM snippet in <head>
styles.css        theme + responsive layout
main.js           tools bar, synced area tabs, 2-step form, dataLayer events
api/contact.js    POST /api/contact -> saves each lead to Google Sheets
apps-script/      Code.gs for the Google Sheet (stores leads, emails admin)
404.html          not-found page (also has the GTM snippet)
assets/           logos, favicons, OG image
robots.txt, sitemap.xml, site.webmanifest, vercel.json
```

## 1. Push to GitHub
```bash
cd fixifydata
git init && git add . && git commit -m "FixifyData website v1"
git branch -M main
git remote add origin https://github.com/<your-username>/fixifydata-website.git
git push -u origin main
```
Create the empty repo first at github.com/new, or run `gh repo create fixifydata-website --public --source=. --push`.

## 2. Deploy on Vercel
1. vercel.com > Add New > Project > import the GitHub repo. Framework preset: **Other**. No build command.
2. Connect the contact form to Google Sheets (step 2b), then add in Settings > Environment Variables:
   - `SHEETS_WEBHOOK_URL`: the Apps Script web app URL (ends in `/exec`)
   - `SHEETS_SECRET`: the same random string you set as `SECRET` in `apps-script/Code.gs`
3. Redeploy after adding the variables.

### 2b. Google Sheet for leads
Every form submission is added as a row to the leads sheet, and an email goes to admin@fixifydata.xyz.
1. Open the sheet > Extensions > Apps Script, and paste in `apps-script/Code.gs`.
2. Change `SECRET` to a long random string.
3. Deploy > New deployment > Web app. Execute as **Me**, access **Anyone**. Approve permissions and copy the URL.
4. Put the URL and secret into Vercel (above) and redeploy.

## 3. Connect fixifydata.xyz
Vercel > Project > Settings > Domains > add `fixifydata.xyz` and `www.fixifydata.xyz`, then at your registrar add the records Vercel shows (typically `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com`). `vercel.json` already 301-redirects www to the apex domain.

## 4. GTM events pushed to the dataLayer
| event | when |
|---|---|
| `cta_click` (`cta_location`) | any "Book a call" / "Get help with..." button |
| `form_start` | first interaction with the form |
| `form_step` (`form_step: 2`) | user reaches step 2 |
| `generate_lead` (`lead_services`, `lead_stage`) | form sent successfully |
| `form_error` | sending failed (user sees an email fallback) |
| `area_select` (`area`, `area_source`) | an area tab is chosen (problems and services stay in sync) |

Every lead email also includes UTMs, click IDs (gclid, fbclid, ttclid, msclkid, li_fat_id), referrer and landing page.

## 5. SEO checklist after launch
- Google Search Console: verify the domain, submit `https://fixifydata.xyz/sitemap.xml`, request indexing.
- Bing Webmaster Tools: import from Search Console.
- Google Business Profile and LinkedIn company page linking to the site.
- Contact email used across the site: admin@fixifydata.xyz. LinkedIn: https://www.linkedin.com/company/fixifydata

## Tool logos
The marquee loads each brand icon from the Simple Icons CDN, falls back to the brand's favicon, then to initials. For official logos, download SVGs from each vendor's brand page into `/assets/logos/` and update the `TOOLS` list at the top of `main.js`.
