import { useEffect } from 'react'

/* ─── CSS-in-JS style injection ─── */
const css = `
  :root {
    --bg:       #0a0a0f;
    --bg2:      #0f0f1a;
    --bg3:      #14141f;
    --card:     #16161f;
    --border:   #1f1f2e;
    --b2:       #2a2a3e;
    --text:     #e8e8f0;
    --t2:       #8888a0;
    --t3:       #404060;
    --orange:   #ff6b1a;
    --orange2:  #cc4a00;
    --amber:    #ffaa00;
    --green:    #00d97e;
    --red:      #ff3d55;
    --blue:     #4488ff;
    --mono:     'Orbitron', sans-serif;
    --sans:     'Inter', sans-serif;
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bot: env(safe-area-inset-bottom, 0px);
  }

  * { box-sizing: border-box; }

  .app {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--sans);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--safe-top) 24px var(--safe-bot);
    position: relative;
    overflow: hidden;
  }

  /* Siatka w tle */
  .app::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(255,107,26,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,107,26,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  /* Linie skanowania */
  .app::after {
    content: '';
    position: fixed; inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(255,107,26,0.008) 3px,
      rgba(255,107,26,0.008) 4px
    );
    pointer-events: none;
    z-index: 0;
  }

  .splash-content {
    position: relative; z-index: 1;
    display: flex; flex-direction: column;
    align-items: center; gap: 0;
    text-align: center;
  }

  .garage-icon {
    width: 80px; height: 80px;
    border: 2px solid var(--orange);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    font-size: 36px;
    margin-bottom: 28px;
    background: rgba(255,107,26,0.06);
    box-shadow: 0 0 40px rgba(255,107,26,0.15), inset 0 0 20px rgba(255,107,26,0.05);
    animation: pulse-border 2.5s ease-in-out infinite;
  }

  @keyframes pulse-border {
    0%, 100% { box-shadow: 0 0 40px rgba(255,107,26,0.15), inset 0 0 20px rgba(255,107,26,0.05); }
    50%       { box-shadow: 0 0 60px rgba(255,107,26,0.30), inset 0 0 30px rgba(255,107,26,0.10); }
  }

  .app-title {
    font-family: var(--mono);
    font-size: 32px; font-weight: 900;
    letter-spacing: 6px;
    color: var(--orange);
    text-shadow: 0 0 40px rgba(255,107,26,0.4);
    line-height: 1;
    margin-bottom: 10px;
  }

  .app-sub {
    font-family: var(--mono);
    font-size: 10px; font-weight: 400;
    letter-spacing: 4px;
    color: var(--t3);
    text-transform: uppercase;
    margin-bottom: 48px;
  }

  .status-row {
    display: flex; gap: 8px; flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 48px;
  }

  .status-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    border: 1px solid var(--border);
    border-radius: 20px;
    font-family: var(--mono);
    font-size: 9px; font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--t2);
    background: var(--bg2);
  }

  .status-chip.ok   { border-color: rgba(0,217,126,0.25); color: var(--green); }
  .status-chip.warn { border-color: rgba(255,170,0,0.25);  color: var(--amber); }

  .dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: currentColor;
  }
  .dot.blink { animation: blink 1.5s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

  .coming-msg {
    font-size: 13px; color: var(--t2);
    line-height: 1.7; max-width: 300px;
    margin-bottom: 40px;
  }
  .coming-msg strong { color: var(--text); }

  .version-tag {
    font-family: var(--mono);
    font-size: 9px; letter-spacing: 2px;
    color: var(--t3);
    border: 1px solid var(--border);
    padding: 4px 12px; border-radius: 4px;
    background: var(--bg2);
  }

  /* Dekoracyjne paski */
  .decor-line {
    width: 120px; height: 1px;
    background: linear-gradient(to right, transparent, var(--orange), transparent);
    margin: 28px auto;
    opacity: 0.4;
  }
`

function injectStyles(id, styles) {
  if (document.getElementById(id)) return
  const el = document.createElement('style')
  el.id = id
  el.textContent = styles
  document.head.appendChild(el)
}

export default function App() {
  useEffect(() => {
    injectStyles('n53-app-styles', css)
  }, [])

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  return (
    <div className="app">
      <div className="splash-content">

        <div className="garage-icon">🔧</div>

        <div className="app-title">N53 GARAGE</div>
        <div className="app-sub">Białogard Custom AI Workshop</div>

        <div className="status-row">
          <div className="status-chip ok">
            <span className="dot blink" />
            PWA GOTOWE
          </div>
          <div className={`status-chip ${apiKey ? 'ok' : 'warn'}`}>
            <span className="dot" />
            {apiKey ? 'API SKONFIGUROWANE' : 'BRAK KLUCZA API'}
          </div>
          <div className="status-chip warn">
            <span className="dot" />
            UI W BUDOWIE
          </div>
        </div>

        <p className="coming-msg">
          Fundament PWA jest gotowy.<br />
          <strong>Następny krok:</strong> zbudujemy pełny interfejs —
          moduł DIAGNOZA, baza kodów OBD-II,
          moduł VISION i wyszukiwarkę TSB.
        </p>

        <div className="decor-line" />

        <div className="version-tag">v0.1.0 — BOOTSTRAP</div>

      </div>
    </div>
  )
}
