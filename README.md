# Engineers Horizon — Website

The new website for **Engineers Horizon**, a real estate developer in Pune. It covers the company, the three ongoing projects (**IOS Prime**, **EH Towers** and **EH Sky Tower**), the delivered projects, and pages for NRI buyers, channel partners, careers, events and the blog.

## What's inside

| Path | What it is |
|---|---|
| `index.html` | Start page. It opens the Home page. |
| `*.dc.html` | The website pages (Home, About, Contact, the three project pages, Blog, FAQ, Events, Careers, NRI Corner, EH-Privilege, EH-Connect). |
| `SiteHeader.dc.html`, `SiteFooter.dc.html`, `EnquiryForm.dc.html` | Shared parts used on every page: the menu, the footer and the enquiry form. |
| `support.js` | The small engine that draws the pages. |
| `eh-motion.js` | Scroll animations, page transitions and section jumps (for example `#amenities`). |
| `eh-maps.js` | Shows a styled map card wherever Google Maps can't load. |
| `vendor/` | React, which the pages run on. It's kept here so the site doesn't depend on any other website. |
| `assets/` | Photos, logos, brochures and MahaRERA certificates. |
| `Start Website (Windows).bat`, `serve.ps1`, `Start Website (Mac).command` | Double-click starters to preview the site on your own computer. You don't need to upload these to hosting. |

## Preview it on your computer

1. Download or clone this repository.
2. **Windows:** double-click `Start Website (Windows).bat`. **Mac:** double-click `Start Website (Mac).command`.
3. The site opens at <http://localhost:8080>.

Opening a `.html` file directly by double-clicking won't work, because browsers block pages that load other files straight from your disk.

## Put it live

Upload everything in this repository, as it is, to any static web hosting (Netlify, Vercel, GitHub Pages, or `public_html` on cPanel). Keep the folder structure the same. No build step is needed.

## Enquiry forms and leads

All forms save to the Google Sheet **[EH Website Leads](https://docs.google.com/spreadsheets/d/1PEfL3XawIEVv4eD_ibjHkYKBjAykVkKKubmo_5P48i8/edit)**, one tab per form:

- Book a site visit (`EnquiryForm.dc.html`) → first tab
- Channel partner registration (EH-Connect page, `PartnerForm.dc.html`) → **Channel Partners** tab
- Refer a friend (EH-Privilege page, `ReferralForm.dc.html`) → **Referrals** tab

Each site-visit lead records the name, phone, email, project, budget, preferred visit date, contact preferences, the page it came from, and ad-campaign tags (`utm_source`, `utm_medium`, `utm_campaign`).

Every new entry is also emailed to vinit.kavade@, divyanshu.mahajan@ and media@engineershorizon.com.

### How it's connected

The forms send each entry to a Google Apps Script web app attached to the sheet (the `SHEET_URL` line near the top of each form's script). The script's code is kept in [`google-apps-script/eh-leads-sheet-script.gs`](google-apps-script/eh-leads-sheet-script.gs).

To change who gets the email alerts, or anything else in the script:

1. Open the sheet → **Extensions → Apps Script**, paste in the updated code and click **Save**.
2. **Deploy → Manage deployments → pencil icon → Version: New version → Deploy.** The web-app link stays the same, so the website doesn't need changing.
3. Copy the same change into `google-apps-script/eh-leads-sheet-script.gs` here, so the repo stays in step.

## Before launch

- Replace the placeholder content: event dates on the Events page, and the EH-Privilege reward terms.
- Add Privacy Policy and Terms pages (the footer links don't go anywhere yet).
- Google Maps and the Plus Jakarta Sans font load once the site is online.
