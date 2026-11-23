ENGINEERS HORIZON WEBSITE
=========================

This folder is the complete website: every page, photo, brochure, RERA
certificate and script it needs.

START PAGE
  index.html opens the Home page (Home.dc.html).

PUTTING IT LIVE
  Upload everything in this folder, as it is, to your web hosting
  (for example into public_html via cPanel or FTP). Keep the folder
  structure the same: the "assets" and "vendor" folders must sit next
  to the pages. Then visit your domain, and the Home page opens.

PREVIEWING ON YOUR OWN COMPUTER (localhost)
  Windows: double-click "Start Website (Windows).bat".
    The website opens in your browser at http://localhost:8080
    (or 8081, 8082... if 8080 is busy). Nothing to install.
    Keep the black window open while you browse; close it to stop.
    If Windows shows "Windows protected your PC", click
    "More info" then "Run anyway" (it's just the starter file).
  Mac: double-click "Start Website (Mac).command"
    (first time: right-click it, choose Open, then Open).
  Note: double-clicking Home.dc.html directly won't work - browsers
  block pages that load other files straight from your disk.
  The starter files are only for previewing. You don't need to
  upload them to your web hosting.

GOOD TO KNOW
  - The Google Maps show live once the site is on the internet.
  - The font (Plus Jakarta Sans) loads from Google Fonts, so it needs
    an internet connection.
  - All forms save to the Google Sheet "EH Website Leads" (one tab per
    form), and every new entry is emailed to the team. This works once
    the site is online or running on localhost with internet. The
    sheet's script is in the google-apps-script folder.

WHAT EACH FILE IS
  Home, About, Contact, IOS Prime, EH Towers, EH Sky Tower, Blog,
  Blog Article, FAQ, Events, Careers, NRI Corner, EH Privilege,
  EH Connect ......... the pages (.dc.html)
  SiteHeader, SiteFooter, EnquiryForm .... shared parts used on every page
  support.js ......... the small engine that draws the pages
  eh-motion.js ....... scroll animations and page transitions
  eh-maps.js ......... Google Maps backup cards
  vendor/ ............ React, which the pages run on (kept local, so the
                       site doesn't depend on any other website)
  assets/ ............ photos, logos, brochures and RERA PDFs
