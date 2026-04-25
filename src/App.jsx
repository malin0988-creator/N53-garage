import { useState } from 'react'

const TABS = [
  { id: 'diagnoza', label: 'DIAGNOZA' },
  { id: 'obd',      label: 'KODY OBD' },
  { id: 'vision',   label: 'VISION'   },
  { id: 'historia', label: 'HISTORIA' },
]

function Placeholder({ title }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '60px 20px', gap: '12px', textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700,
        letterSpacing: '3px', color: 'var(--orange)',
        border: '1px solid rgba(255,107,26,0.3)', padding: '6px 18px',
        borderRadius: '6px', background: 'rgba(255,107,26,0.05)',
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: '9px',
        color: 'var(--t3)', letterSpacing: '2px',
      }}>
        W BUDOWIE
      </div>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('diagnoza')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── HEADER ── */}
      <header className="hdr">
        <div>
          <div className="hdr-logo">N53<span> GARAGE</span></div>
          <div className="hdr-sub">BIAŁOGARD CUSTOM AI</div>
        </div>
        <div className="hdr-right">
          <div className="hdr-status">
            <span className="hdr-dot" />
            AI ONLINE
          </div>
          <div className="hdr-ver">v0.2.0</div>
        </div>
      </header>

      {/* ── NAV ── */}
      <nav className="nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* ── CONTENT ── */}
      <main className="content">
        {tab === 'diagnoza' && <Placeholder title="DIAGNOZA" />}
        {tab === 'obd'      && <Placeholder title="KODY OBD" />}
        {tab === 'vision'   && <Placeholder title="VISION"   />}
        {tab === 'historia' && <Placeholder title="HISTORIA" />}
      </main>

    </div>
  )
}
