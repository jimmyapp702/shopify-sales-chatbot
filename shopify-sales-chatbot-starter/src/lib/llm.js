import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

function loadKB() {
  const kbDir = path.join(process.cwd(), 'kb');
  if (!fs.existsSync(kbDir)) return [];
  const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.md'));
  return files.map(f => ({
    name: f,
    content: fs.readFileSync(path.join(kbDir, f), 'utf8')
  }));
}

function naiveRetrieve(question, k=3) {
  const docs = loadKB();
  const terms = question.toLowerCase().split(/\W+/).filter(Boolean);
  const scored = docs.map(d => {
    const score = terms.reduce((acc, t) => acc + (d.content.toLowerCase().includes(t) ? 1 : 0), 0);
    return { ...d, score };
  }).sort((a,b)=>b.score-a.score);
  return scored.slice(0,k);
}

export async function askLLM(messages) {
  const question = messages[messages.length-1]?.content || '';
  const topDocs = naiveRetrieve(question, 3);
  const sources = topDocs.map(d => `--- ${d.name} ---\n${d.content}`).join('\n\n');

  const system = `You are a concise, sales-focused assistant for a Shopify store.
Only answer sales-related questions (shipping, returns, sizing, promos, product info).
If a question is not sales-related, politely say you can only help with sales topics and offer escalation.
Prefer the brand policies below as ground truth. If unsure or instructions conflict, ask a clarifying question.
When referencing policy, quote the relevant line briefly and avoid making up details.
If you cannot confidently answer, suggest escalating to a support agent.`;

  if (!openai) {
    const snippet = topDocs.map(d => d.content.slice(0, 300)).join('\n\n');
    return `Here\'s what I can share based on policy:\n\n${snippet || 'No policies found. Please upload KB.'}\n\nIf you need more help, I can escalate to a human.`;
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role:'system', content: system },
      { role:'user', content: `Customer question: "${question}"\n\nBrand policies and FAQs:\n${sources || '(none provided)'}` }
    ],
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content?.trim() || 'I couldn\'t form an answer just now.';
}
