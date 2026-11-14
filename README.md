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

All forms save to **Supabase** (project *Engineers Horizon Website*):

- Enquiry forms → table `leads`
- Channel partner registration (EH-Connect page, `PartnerForm.dc.html`) → table `channel_partners`
- Refer a friend (EH-Privilege page, `ReferralForm.dc.html`) → table `referrals`

Every enquiry form saves the lead to the `leads` table. Each lead records the name, phone, email, project, budget, preferred visit date, contact preferences, the page it came from, and ad-campaign tags (`utm_source`, `utm_medium`, `utm_campaign`).

The Supabase key in `EnquiryForm.dc.html` is a **publishable** key and is meant to be public. Database security only lets website visitors *add* leads. Leads can't be read, changed or deleted from the website; the team views them in the Supabase dashboard (**Table Editor → leads**).

## Before launch

- Replace the placeholder content: event dates on the Events page, and the EH-Privilege reward terms.
- Add Privacy Policy and Terms pages (the footer links don't go anywhere yet).
- Google Maps and the Plus Jakarta Sans font load once the site is online.
