// Vercel serverless function: POST /api/contact
// Saves each lead to your Google Sheet (via the Apps Script in /apps-script/Code.gs),
// which also emails admin@fixifydata.xyz.
//
// Set these in Vercel > Project > Settings > Environment Variables:
//   SHEETS_WEBHOOK_URL  - the Apps Script "Web app" URL (ends in /exec)
//   SHEETS_SECRET       - any long random string; must match SECRET in Code.gs

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (body.fax) return res.status(200).json({ ok: true });

  const lead = {
    name: String(body.name || '').trim().slice(0, 120),
    email: String(body.email || '').trim().slice(0, 200),
    company: String(body.company || '').trim().slice(0, 200),
    website: String(body.website || '').trim().slice(0, 300),
    services: Array.isArray(body.services) ? body.services.slice(0, 10).map(s => String(s).slice(0, 60)).join(', ') : '',
    stage: String(body.stage || '').trim().slice(0, 60),
    message: String(body.message || '').trim().slice(0, 5000),
    attribution: String(body.attribution || '').slice(0, 2000),
    user_agent: String(req.headers['user-agent'] || '').slice(0, 300),
    country: String(req.headers['x-vercel-ip-country'] || '')
  };

  lead.consent = body.consent === true ? 'Yes' : 'No';

  if (!lead.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || !lead.message || lead.consent !== 'Yes') {
    return res.status(400).json({ ok: false, error: 'Name, a valid email, a message and consent are required.' });
  }

  const { SHEETS_WEBHOOK_URL, SHEETS_SECRET } = process.env;
  if (!SHEETS_WEBHOOK_URL || !SHEETS_SECRET) {
    console.error('Contact form: SHEETS_WEBHOOK_URL or SHEETS_SECRET is not set');
    return res.status(500).json({ ok: false, error: 'Form storage is not configured.' });
  }

  try {
    const r = await fetch(SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret: SHEETS_SECRET, lead }),
      redirect: 'follow'
    });
    const text = await r.text();
    let out = {};
    try { out = JSON.parse(text); } catch { /* not JSON */ }
    if (!r.ok || !out.ok) {
      console.error('Sheets webhook error', r.status, text.slice(0, 500));
      return res.status(502).json({ ok: false, error: 'Could not save the lead.' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Unexpected error.' });
  }
};
