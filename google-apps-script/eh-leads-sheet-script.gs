// Engineers Horizon — website forms → Google Sheet "EH Website Leads"
//   Site-visit enquiries  → first tab (Website Leads)
//   Channel partner forms → "Channel Partners" tab (made automatically on the first entry)
//   Referral forms        → "Referrals" tab (made automatically on the first entry)

const SHEET_ID = '1PEfL3XawIEVv4eD_ibjHkYKBjAykVkKKubmo_5P48i8';
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit';

// Who gets an email alert for every new website entry (add or remove addresses here)
const NOTIFY = [
  'vinit.kavade@engineershorizon.com',
  'divyanshu.mahajan@engineershorizon.com',
  'media@engineershorizon.com'
];

const FORMS = {
  enquiry: {
    label: 'Site visit enquiry', nameKey: 'full_name', extraKey: 'project',
    tab: null, // null = first tab
    headers: ['Received At', 'Full Name', 'Phone', 'Email', 'Project', 'Budget', 'Preferred Visit Date', 'Contact Methods', 'Source Page', 'UTM Source', 'UTM Medium', 'UTM Campaign'],
    fields: ['full_name', 'phone', 'email', 'project', 'budget', 'preferred_visit_date', 'contact_methods', 'source_page', 'utm_source', 'utm_medium', 'utm_campaign'],
    required: ['full_name', 'phone']
  },
  partner: {
    label: 'Channel partner registration', nameKey: 'contact_name', extraKey: 'firm_name',
    tab: 'Channel Partners',
    headers: ['Received At', 'Firm Name', 'Contact Name', 'Phone', 'Email', 'RERA Agent No.', 'Area', 'Experience', 'Source Page'],
    fields: ['firm_name', 'contact_name', 'phone', 'email', 'rera_agent_no', 'area', 'experience', 'source_page'],
    required: ['contact_name', 'phone']
  },
  referral: {
    label: 'Referral', nameKey: 'friend_name', extraKey: 'friend_project',
    tab: 'Referrals',
    headers: ['Received At', 'Referrer Name', 'Referrer Phone', 'Referrer Project', 'Referrer Flat', 'Friend Name', 'Friend Phone', 'Friend Project', 'Source Page'],
    fields: ['referrer_name', 'referrer_phone', 'referrer_project', 'referrer_flat', 'friend_name', 'friend_phone', 'friend_project', 'source_page'],
    required: ['referrer_name', 'friend_phone']
  }
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // two entries at the same second won't overwrite each other
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const cfg = FORMS[d.form] || FORMS.enquiry;
    if (cfg.required.some(k => !d[k])) return reply({ ok: false, error: 'missing required fields' });

    // A cell starting with = + - @ would be read as a formula; the ' keeps it as plain text (phone numbers start with +)
    const safe = v => {
      const s = v == null ? '' : String(Array.isArray(v) ? v.join(', ') : v).slice(0, 300);
      return /^[=+\-@]/.test(s) ? "'" + s : s;
    };

    const book = SpreadsheetApp.openById(SHEET_ID);
    let sheet = cfg.tab ? book.getSheetByName(cfg.tab) : book.getSheets()[0];
    if (!sheet) {
      sheet = book.insertSheet(cfg.tab);
      sheet.appendRow(cfg.headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, cfg.headers.length).setFontWeight('bold');
    }
    const when = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy HH:mm');
    sheet.appendRow([when].concat(cfg.fields.map(k => safe(d[k]))));

    // Email alert — if it fails (e.g. daily email limit), the row is still saved
    try { notify(cfg, d, when); } catch (mailErr) { console.error('Email alert failed: ' + mailErr); }
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function notify(cfg, d, when) {
  const esc = v => String(v == null || v === '' ? '—' : (Array.isArray(v) ? v.join(', ') : v))
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const plain = v => String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').slice(0, 80);

  const rows = cfg.fields.map((k, i) =>
    '<tr><td style="padding:6px 14px 6px 0;color:#6B5546;white-space:nowrap;">' + cfg.headers[i + 1] + '</td>' +
    '<td style="padding:6px 0;color:#3A2A20;font-weight:600;">' + esc(d[k]) + '</td></tr>').join('');

  const html =
    '<div style="font-family:Arial,sans-serif;font-size:14px;color:#3A2A20;">' +
    '<p style="margin:0 0 4px;font-size:12px;letter-spacing:.1em;color:#A8643F;">NEW ' + cfg.label.toUpperCase() + ' · ' + when + '</p>' +
    '<p style="margin:0 0 14px;">A new entry just came in from the Engineers Horizon website.</p>' +
    '<table style="border-collapse:collapse;">' + rows + '</table>' +
    '<p style="margin:18px 0 0;"><a href="' + SHEET_URL + '" style="color:#A8643F;">Open the EH Website Leads sheet →</a></p></div>';

  const subject = 'New ' + cfg.label + ': ' + plain(d[cfg.nameKey]) + (d[cfg.extraKey] ? ' · ' + plain(d[cfg.extraKey]) : '');
  const options = { htmlBody: html, name: 'EH Website' };
  if (d.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) options.replyTo = String(d.email); // hitting Reply emails the lead

  MailApp.sendEmail(NOTIFY.join(','), subject, 'New ' + cfg.label + ' at ' + when + '. Open the sheet: ' + SHEET_URL, options);
}

// Opening the web-app link in a browser shows this, so you can check it's live
function doGet() {
  return reply({ ok: true, message: 'EH leads endpoint is running' });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
