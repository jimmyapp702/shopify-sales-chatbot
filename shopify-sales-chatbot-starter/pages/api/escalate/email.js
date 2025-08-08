import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { customerEmail, subject = 'Chat escalation', transcript, tags = [] } = req.body || {};

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SUPPORT_ESCALATION_EMAIL,
      subject: `[Chat Escalation] ${subject}`,
      text: `Customer: ${customerEmail || 'unknown'}\nTags: ${tags.join(', ')}\n\nTranscript:\n${transcript || '(none)'}`
    });

    res.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Email escalation failed' });
  }
}
