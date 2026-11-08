/**
 * Fixify lead form -> Google Sheet (+ email to admin)
 *
 * Setup (once):
 * 1. Open the sheet: https://docs.google.com/spreadsheets/d/1ipzBvGA-goqJi6p6kQ2m6gp-hJ5ykOQ4u19mCYbPVJ0/edit
 * 2. Extensions > Apps Script. Delete the sample code and paste this whole file.
 * 3. Change SECRET below to a long random string (use the same value as SHEETS_SECRET in Vercel).
 * 4. Deploy > New deployment > type "Web app".
 *      Execute as: Me      Who has access: Anyone
 *    Approve the permissions, then copy the Web app URL (ends in /exec).
 * 5. In Vercel, set SHEETS_WEBHOOK_URL = that URL and SHEETS_SECRET = your secret, then redeploy.
 *
 * If you edit this script later: Deploy > Manage deployments > Edit > Version: New version.
 */

const SHEET_ID = '1ipzBvGA-goqJi6p6kQ2m6gp-hJ5ykOQ4u19mCYbPVJ0';
const SECRET = 'CHANGE-ME-to-a-long-random-string';
const NOTIFY_EMAIL = 'admin@fixifydata.xyz';

const HEADERS = ['Submitted at', 'Name', 'Email', 'Website', 'Areas', 'Stage', 'Message',
                 'Country', 'Attribution', 'User agent', 'Company', 'Consent'];
// NOTE: 'Company' and 'Consent' are appended as the last two columns so existing rows stay aligned.
// If your sheet already has a header row, add these two headings to cells K1 and L1.

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (data.secret !== SECRET) return json_({ ok: false, error: 'unauthorized' });
    const l = data.lead || {};

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const row = [new Date(), l.name, l.email, l.website, l.services, l.stage, l.message,
                 l.country, l.attribution, l.user_agent, l.company, l.consent].map(safe_);
    row[0] = new Date();
    sheet.appendRow(row);

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: l.email,
      subject: 'New Fixify lead: ' + l.name + ' (' + (l.services || 'General') + ')',
      body: [
        'Name: ' + l.name,
        'Email: ' + l.email,
        'Company: ' + (l.company || '-'),
        'Website: ' + (l.website || '-'),
        'Areas: ' + (l.services || '-'),
        'Stage: ' + (l.stage || '-'),
        'Agreed to privacy policy: ' + (l.consent || '-'),
        '',
        'Message:',
        l.message || '-',
        '',
        'Country: ' + (l.country || '-'),
        'Attribution: ' + (l.attribution || '-'),
        '',
        'Sheet: https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit'
      ].join('\n')
    });

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Stop spreadsheet formula injection (=, +, -, @ at the start of a cell)
function safe_(v) {
  v = v == null ? '' : String(v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
