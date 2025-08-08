import { useEffect, useRef, useState } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hey! I'm your sales assistant. I can help with order status, shipping, returns, sizes, and promos. What can I do for you?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages, loading]);

  async function sendMessage(text) {
    if (!text.trim()) return;
    const newMsgs = [...messages, { role:'user', content: text }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs })
      });
      const data = await res.json();
      setMessages(m => [...m, data.reply]);
    } catch (e) {
      setMessages(m => [...m, { role:'assistant', content: 'Oops—something went wrong. Try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  const quickies = [
    'Where is my order?',
    'What is your return policy?',
    'Do you have a discount code?',
    'Show me men\'s XL mesh liner trunks under $60'
  ];

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', fontFamily:'ui-sans-serif, system-ui'}}>
      <div style={{padding:'12px 14px', borderBottom:'1px solid #eee', display:'flex', alignItems:'center', gap:8}}>
        <div style={{fontWeight:700}}>Sales Assistant</div>
        <div style={{marginLeft:'auto', fontSize:12, opacity:.6}}>Sales-focused • Escalates if needed</div>
      </div>

      <div ref={listRef} style={{flex:1, overflowY:'auto', padding:16, background:'#fafafa'}}>
        {messages.map((m, i) => (
          <div key={i} style={{margin:'10px 0', display:'flex', justifyContent: m.role==='user'?'flex-end':'flex-start'}}>
            <div style={{maxWidth:'80%', padding:'10px 12px', borderRadius:10, background: m.role==='user'?'#111':'#fff',
              color: m.role==='user'?'#fff':'#111', boxShadow: '0 2px 8px rgba(0,0,0,.06)'}}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{fontSize:12, opacity:.6}}>Thinking…</div>}
      </div>

      <div style={{padding:12, borderTop:'1px solid #eee'}}>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:8}}>
          {quickies.map(q => (
            <button key={q} onClick={() => sendMessage(q)} style={{fontSize:12, padding:'6px 8px', border:'1px solid #ddd',
              borderRadius:999, background:'#fff', cursor:'pointer'}}>{q}</button>
          ))}
        </div>
        <form onSubmit={e=>{e.preventDefault(); sendMessage(input);}} style={{display:'flex', gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message…"
            style={{flex:1, padding:'10px 12px', border:'1px solid #ddd', borderRadius:10}} />
          <button type="submit" disabled={loading} style={{padding:'10px 14px', borderRadius:10, border:'1px solid #111', background:'#111', color:'#fff', cursor:'pointer'}}>Send</button>
        </form>
      </div>
    </div>
  );
}
