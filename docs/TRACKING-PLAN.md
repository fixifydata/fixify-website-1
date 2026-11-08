# Tracking plan: fixifydata.xyz

## How consent works

- Every page sets **Google Consent Mode v2 defaults to denied** (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`, `functionality_storage`, `personalization_storage`) in the `<head>`, before anything else. Only `security_storage` is granted.
- **Google Tag Manager (`GTM-WX7FZ79N`) is not loaded until the visitor accepts analytics.** Reject, or no choice, means no request to Google at all.
- Accept sends one `consent update` with `analytics_storage: granted` only. Ad signals stay denied because the site runs no ads.
- All events go through `window.fixifyTrack()` (in `consent.js`), which does nothing unless analytics is granted. Withdrawing consent stops events straight away, sets `analytics_storage` back to denied and removes `_ga*` cookies it can reach.
- There is deliberately **no `<noscript>` GTM iframe**, because it would load GTM without consent.
- The choice is stored in `localStorage` as `fixify_consent_v1`. "Cookie settings" in every footer reopens it.

## Events (dataLayer)

| Event | Fires when | Parameters | Once per… |
|---|---|---|---|
| `cta_click` | Any **Let’s talk** button (nav, hero, sections, service panels, footer, mobile bar) or "Ask us." | `cta_label`, `cta_location` (`nav`, `hero`, `finds`, `service_<area>`, `involved`, `process`, `footer`, `sticky`, `services_other`) | click |
| `form_start` | First focus or change inside the form | `form_name: contact` | page view |
| `form_step_complete` | "Next" succeeds (step 1 done) | `form_name`, `form_step: 1` | step completion |
| `form_submit` | Server accepted the submission | `form_name` | successful submit |
| `generate_lead` | Same moment as `form_submit` (GA4 recommended event) | `form_name`, `lead_services` (pipe-separated), `lead_stage` | successful submit |
| `form_error` | Submission failed (email fallback shown) | `form_name` | failure |
| `tab_select` | A tab is chosen by the visitor (problem tabs, service tabs, or a "See what we do"/footer link) | `tab_area`, `tab_group` (`problems`, `services`, `goto`) | selection |
| `faq_open` | A FAQ item is opened | `faq_question` | open |
| `outbound_click` | LinkedIn or email link clicked | `link_type` (`linkedin`, `email`), `link_url` | click |
| `scroll_depth` | Page scrolled to 50% and 90% | `percent_scrolled` (`50`, `90`) | each threshold, once |

Not an event, but useful: `consent_withdrawn` is pushed when someone turns analytics off after having accepted.

## GTM container setup (to do in the GTM UI)

1. **Consent Initialization**: nothing needed. Defaults are already set on the page.
2. Add a **Google tag (GA4)** with your measurement ID. Under Consent Settings, require `analytics_storage`.
3. For each event above, create a **Custom Event trigger** with the exact event name and a **GA4 Event tag** that sends it, mapping the listed parameters as event parameters. Mark `generate_lead` as a key event in GA4.
4. Register the custom dimensions you want to report on (`cta_location`, `tab_area`, `link_type`, `percent_scrolled`) in GA4.
5. Use GTM Preview with the site: accept analytics, then confirm each event fires once; reject and confirm GTM never loads.

## Verified in this build (local, headless Edge, GTM stubbed)

Before consent: no events, no GTM request. After Accept: GTM requested exactly once, each event above fires exactly once per action (including `scroll_depth` 50 and 90), `cta_click` carries label and location. After withdrawal: `analytics_storage` set to denied and no further events. Not verified: the live GTM container itself (needs the setup above).
