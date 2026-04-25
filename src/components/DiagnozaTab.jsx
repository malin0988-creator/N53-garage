import { useState } from 'react'
import { diagnose, hasApiKey } from '../api/claude'

const UKLADY = [
  'SILNIK', 'SKRZYNIA', 'PALIWO', 'ROZRZĄD',
  'CHŁODZENIE', 'ELEKTRYKA', 'HAMULCE', 'ZAWIESZENIE',
]

const SEV = {
  KRYTYCZNY:   { cls: 'rv-kryt',  badge: 'badge-kryt',  icon: '🔴' },
  POWAŻNY:     { cls: 'rv-powaz', badge: 'badge-powaz', icon: '🟠' },
  UMIARKOWANY: { cls: 'rv-umir',  badge: 'badge-umir',  icon: '🟡' },
  NISKI:       { cls: 'rv-niski', badge: 'badge-niski', icon: '🟢' },
}

const LOADING_MSGS = [
  'Analizuję układ pojazdu…',
  'Sprawdzam bazę usterek…',
  'Konsultuję z AI…',
  'Przygotowuję diagnozę…',
]

export default function DiagnozaTab({ onSave }) {
  const [form, setForm] = useState({
    marka: '', model: '', rok: '', przebieg: '', objawy: '', kodyOBD: '',
  })
  const [uklad, setUklad]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState(0)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const [saved, setSaved]     = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleDiagnose = async () => {
    if (!form.objawy.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSaved(false)

    // cycle loading messages
    let i = 0
    const interval = setInterval(() => { i = (i + 1) % LOADING_MSGS.length; setLoadMsg(i) }, 1800)

    try {
      const res = await diagnose({ ...form, uklad })
      setResult(res)
    } catch (e) {
      setError(e.message)
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!result) return
    onSave({
      id: Date.now(),
      date: new Date().toLocaleDateString('pl-PL'),
      car: [form.marka, form.model, form.rok].filter(Boolean).join(' ') || 'Nieznany pojazd',
      severity: result.severity,
      diagnosis: result.diagnosis,
      result,
      form,
    })
    setSaved(true)
  }

  const sev = result ? (SEV[result.severity] ?? SEV.NISKI) : null
  const confColor = !result ? '#00d97e'
    : result.confidence >= 75 ? 'var(--green)'
    : result.confidence >= 45 ? 'var(--amber)'
    : 'var(--red)'

  const apiOk = hasApiKey()

  return (
    <div>
      {/* API key warning */}
      {!apiOk && (
        <div className="warn-box">
          <strong>BRAK KLUCZA API</strong>
          Dodaj <code style={{ color: 'var(--amber)', fontFamily: 'var(--mono)', fontSize: '11px' }}>VITE_ANTHROPIC_API_KEY</code> do
          pliku <code style={{ color: 'var(--amber)', fontFamily: 'var(--mono)', fontSize: '11px' }}>.env</code> i przebuduj aplikację,
          aby włączyć diagnostykę AI.
        </div>
      )}

      {/* Vehicle card */}
      <div className="card">
        <div className="card-title">Pojazd</div>
        <div className="row-2">
          <div className="field">
            <label>Marka</label>
            <input value={form.marka} onChange={set('marka')} placeholder="np. BMW" />
          </div>
          <div className="field">
            <label>Model</label>
            <input value={form.model} onChange={set('model')} placeholder="np. E60 N53" />
          </div>
        </div>
        <div className="row-2">
          <div className="field">
            <label>Rok</label>
            <input value={form.rok} onChange={set('rok')} placeholder="np. 2007" inputMode="numeric" />
          </div>
          <div className="field">
            <label>Przebieg (km)</label>
            <input value={form.przebieg} onChange={set('przebieg')} placeholder="np. 180 000" inputMode="numeric" />
          </div>
        </div>
      </div>

      {/* Symptoms card */}
      <div className="card">
        <div className="card-title">Objawy i kody błędów</div>
        <div className="field">
          <label>Opis objawów</label>
          <textarea
            value={form.objawy}
            onChange={set('objawy')}
            placeholder="Opisz szczegółowo — kiedy występuje, jak brzmi silnik, czy zapalają się kontrolki…"
            rows={4}
          />
        </div>
        <div className="field">
          <label>Kody OBD (opcjonalnie)</label>
          <input
            value={form.kodyOBD}
            onChange={set('kodyOBD')}
            placeholder="np. P0301, P0172"
          />
        </div>
      </div>

      {/* System chips */}
      <div className="card">
        <div className="card-title">Układ (opcjonalnie)</div>
        <div className="chips">
          {UKLADY.map(u => (
            <button
              key={u}
              className={`chip${uklad === u ? ' selected' : ''}`}
              onClick={() => setUklad(v => v === u ? null : u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="err-box">
          <strong>BŁĄD DIAGNOSTYKI</strong>
          {error}
        </div>
      )}

      {/* CTA button */}
      <button
        className="btn-primary"
        style={{ marginBottom: 14 }}
        onClick={handleDiagnose}
        disabled={loading || !form.objawy.trim() || !apiOk}
      >
        {loading ? '⟳ ANALIZA W TOKU…' : '⚡ DIAGNOZUJ'}
      </button>

      {/* Loading */}
      {loading && (
        <div className="loading">
          <div className="spinner" />
          <div className="loading-txt">{LOADING_MSGS[loadMsg]}</div>
          <div className="loading-sub">Model: claude-haiku · N53 AI Engine</div>
        </div>
      )}

      {/* Results */}
      {result && sev && (
        <div className="result-block">

          {/* Verdict */}
          <div className={`result-verdict ${sev.cls}`}>
            <div className="rv-label">PRIORYTET NAPRAWY</div>
            <div className="rv-value">{sev.icon} {result.severity}</div>
            <div className="rv-text">{result.diagnosis}</div>
            <div className="conf-row">
              <div className="conf-lbl">PEWNOŚĆ</div>
              <div className="conf-track">
                <div className="conf-fill" style={{ width: `${result.confidence}%`, background: confColor }} />
              </div>
              <div className="conf-lbl">{result.confidence}%</div>
            </div>
          </div>

          {/* Causes */}
          {result.likely_causes?.length > 0 && (
            <div className="card">
              <div className="card-title">Prawdopodobne przyczyny</div>
              <ul className="res-list">
                {result.likely_causes.map((c, i) => (
                  <li key={i} className="li-num">
                    <span className="li-marker">{i + 1}.</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {result.immediate_actions?.length > 0 && (
            <div className="card">
              <div className="card-title">Działania natychmiastowe</div>
              <ul className="res-list">
                {result.immediate_actions.map((a, i) => (
                  <li key={i} className="li-check">
                    <span className="li-marker">✓</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical details */}
          {result.technical_details && (
            <div className="card">
              <div className="card-title">Szczegóły techniczne</div>
              <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>
                {result.technical_details}
              </p>
            </div>
          )}

          {/* Cost & dealer */}
          <div className="card">
            <div className="card-title">Koszty i zalecenia</div>
            {result.estimated_cost && (
              <div className="cost-row">
                <span className="cost-lbl">Szacunkowy koszt naprawy</span>
                <span className="cost-val" style={{ color: 'var(--amber)' }}>{result.estimated_cost}</span>
              </div>
            )}
            <div className="cost-row">
              <span className="cost-lbl">Wymaga ASO / specjalisty</span>
              <span className="cost-val" style={{ color: result.dealer_required ? 'var(--red)' : 'var(--green)' }}>
                {result.dealer_required ? 'TAK' : 'NIE'}
              </span>
            </div>
          </div>

          {/* Additional checks */}
          {result.additional_checks?.length > 0 && (
            <div className="card">
              <div className="card-title">Dodatkowe sprawdzenia</div>
              <ul className="res-list">
                {result.additional_checks.map((c, i) => (
                  <li key={i} className="li-arrow">
                    <span className="li-marker">→</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Save button */}
          <button
            className="btn-secondary"
            style={{ width: '100%', marginBottom: 14 }}
            onClick={handleSave}
            disabled={saved}
          >
            {saved ? '✓ ZAPISANO W HISTORII' : 'ZAPISZ DIAGNOZĘ'}
          </button>
        </div>
      )}
    </div>
  )
}
