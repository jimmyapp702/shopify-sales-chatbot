(function() {
  if (window.__salesBotLoaded) return; window.__salesBotLoaded = true;

  const brand = (document.currentScript && document.currentScript.dataset.botBrand) || 'Sales Assistant';
  const proactive = (document.currentScript && document.currentScript.dataset.proactive) === 'true';

  const style = document.createElement('style');
  style.textContent = `
    #salesbot-bubble { position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px; border-radius: 50%;
      box-shadow: 0 10px 24px rgba(0,0,0,.18); background: #111; color: #fff; display:flex; align-items:center;
      justify-content:center; cursor:pointer; z-index: 2147483647; font-weight: 700; font-family: ui-sans-serif, system-ui; }
    #salesbot-panel { position: fixed; bottom: 90px; right: 20px; width: 360px; height: 520px; box-shadow: 0 16px 40px rgba(0,0,0,.22);
      border-radius: 12px; overflow: hidden; background: #fff; display:none; z-index: 2147483647; }
    #salesbot-iframe { width: 100%; height: 100%; border: none; }
    @media (max-width: 480px) {
      #salesbot-panel { width: 96vw; height: 70vh; right: 2vw; bottom: 80px; }
    }
    .salesbot-badge { position:absolute; top:-6px; right:-6px; background:#e11d48; color:#fff; font-size:11px; padding:2px 6px;
      border-radius:999px; box-shadow: 0 4px 10px rgba(0,0,0,.2); }
  `;
  document.head.appendChild(style);

  const bubble = document.createElement('div');
  bubble.id = 'salesbot-bubble';
  bubble.title = brand;
  bubble.innerHTML = '💬';

  const badge = document.createElement('div');
  badge.className = 'salesbot-badge';
  badge.innerText = 'Hi';
  bubble.appendChild(badge);

  const panel = document.createElement('div');
  panel.id = 'salesbot-panel';

  const iframe = document.createElement('iframe');
  iframe.id = 'salesbot-iframe';
  iframe.src = '/chat';
  panel.appendChild(iframe);

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  function toggle(open) {
    panel.style.display = open ? 'block' : 'none';
    badge.style.display = open ? 'none' : 'block';
  }

  bubble.addEventListener('click', () => toggle(panel.style.display !== 'block'));

  if (proactive) {
    setTimeout(() => { badge.innerText = 'Need help?'; }, 2500);
  }
})();
