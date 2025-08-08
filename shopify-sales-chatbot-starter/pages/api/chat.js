import { getOrderStatus, searchProducts } from '../../src/lib/shopify';
import { askLLM } from '../../src/lib/llm';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages = [] } = req.body || {};
  const last = messages[messages.length - 1]?.content || '';

  // Simple intent classification
  const text = last.toLowerCase();
  try {
    if (/(where.*order|wismo|track.*order)/.test(text)) {
      return res.json({ reply: { role:'assistant', content: 'I can help with that. Please share the email used at checkout and (optionally) your order number.' } });
    }
    if (/return|exchange/.test(text)) {
      return res.json({ reply: { role:'assistant', content: 'Our returns are simple: 30 days from delivery for unworn items with tags. Want me to start a return or share the policy?' } });
    }
    if (/discount|promo|code/.test(text)) {
      return res.json({ reply: { role:'assistant', content: 'We occasionally run promotions. I can check eligibility or share current offers. What are you shopping for?' } });
    }
    if (/show me|looking for|in stock|size|color/.test(text)) {
      const resp = await searchProducts(last);
      return res.json({ reply: { role:'assistant', content: resp || 'I can help you find products by size, color, and price.' } });
    }

    // Fallback to KB/LLM if configured
    const llm = await askLLM(messages);
    return res.json({ reply: { role:'assistant', content: llm } });
  } catch (e) {
    console.error(e);
    return res.json({ reply: { role:'assistant', content: 'I hit a snag while handling that. You can ask me again or click "Talk to a human" to escalate.' } });
  }
}
