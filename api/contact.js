const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// load .env.local in development if env vars aren't already set
if (!process.env.RESEND_API_KEY) {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const i = line.indexOf('=');
      if (i > 0) process.env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
  } catch {}
}

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, org, service, message, budget } = req.body;

  if (!firstName || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `New Strategy Call Request — ${firstName} ${lastName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
          <div style="background:#04090f;padding:24px 32px;margin-bottom:0;">
            <span style="font-size:1.2rem;font-weight:700;color:#fff;">Hex<span style="color:#03acf0;">AI</span></span>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:32px;">
            <h2 style="margin:0 0 24px;font-size:1.3rem;">New Strategy Call Request</h2>

            <table style="width:100%;border-collapse:collapse;font-size:.9rem;">
              <tr><td style="padding:8px 0;color:#6b7280;width:140px;">Name</td><td style="padding:8px 0;font-weight:600;">${firstName} ${lastName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#03acf0;">${email}</a></td></tr>
              ${org ? `<tr><td style="padding:8px 0;color:#6b7280;">Organisation</td><td style="padding:8px 0;">${org}</td></tr>` : ''}
              ${service ? `<tr><td style="padding:8px 0;color:#6b7280;">Interest</td><td style="padding:8px 0;">${service}</td></tr>` : ''}
              ${budget ? `<tr><td style="padding:8px 0;color:#6b7280;">Budget</td><td style="padding:8px 0;">${budget}</td></tr>` : ''}
            </table>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
            <p style="color:#6b7280;font-size:.8rem;margin:0 0 8px;">Message</p>
            <p style="margin:0;line-height:1.7;white-space:pre-wrap;">${message}</p>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
            <a href="mailto:${email}" style="display:inline-block;background:#03acf0;color:#04090f;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:.85rem;font-weight:600;">Reply to ${firstName}</a>
          </div>
          <div style="padding:16px 32px;color:#9ca3af;font-size:.75rem;">
            Sent via hexai.gm contact form
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return res.status(500).json({ error: result.error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
