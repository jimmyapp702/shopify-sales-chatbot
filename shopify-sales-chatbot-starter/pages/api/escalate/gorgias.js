import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { customerEmail, subject = 'Chat escalation', transcript, tags = [] } = req.body || {};

  const base = `https://${process.env.GORGIAS_DOMAIN}/api`;
  const auth = {
    username: process.env.GORGIAS_API_USERNAME,
    password: process.env.GORGIAS_API_TOKEN
  };

  try {
    // Create a ticket (basic)
    const ticket = await axios.post(`${base}/tickets`, {
      subject: `[Chat] ${subject}`,
      via: 'api',
      tags,
    }, { auth });

    // Add a message to the ticket
    await axios.post(`${base}/messages`, {
      channel: 'email',
      source: { to: [{ address: customerEmail || 'unknown@unknown.com' }], from: { address: 'bot@yourbrand.com' } },
      sender: { address: customerEmail || 'unknown@unknown.com' },
      body_text: transcript || '(no transcript)',
      ticket_id: ticket.data.id
    }, { auth });

    res.json({ ok: true, ticketId: ticket.data.id });
  } catch (e) {
    console.error(e?.response?.data || e.message);
    res.status(500).json({ error: 'Gorgias escalation failed', details: e?.response?.data || e.message });
  }
}
