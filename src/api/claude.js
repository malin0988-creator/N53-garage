const API_URL = 'https://api.anthropic.com/v1/messages'

function getKey() {
  return localStorage.getItem('n53_api_key') || import.meta.env.VITE_ANTHROPIC_API_KEY || ''
}

export function hasApiKey() {
  return Boolean(getKey())
}

export async function diagnose({ marka, model, rok, przebieg, objawy, kodyOBD, uklad }) {
  const apiKey = getKey()
  if (!apiKey) throw new Error('Brak klucza API. Wpisz go w Ustawieniach lub dodaj do pliku .env')

  const pojazd = [marka, model, rok ? `(${rok})` : ''].filter(Boolean).join(' ') || 'Nieznany pojazd'
  const prompt = `Jesteś ekspertem diagnostyki samochodowej z 20 latach doświadczenia, specjalizujesz się w silnikach BMW N53/N54 i pojazdach europejskich.

DANE POJAZDU:
- Pojazd: ${pojazd}
- Przebieg: ${przebieg ? przebieg + ' km' : 'nieznany'}
- Zgłoszony układ: ${uklad || 'nieznany'}
- Objawy: ${objawy}${kodyOBD ? `\n- Kody OBD: ${kodyOBD}` : ''}

Przeprowadź diagnozę i odpowiedz WYŁĄCZNIE w formacie JSON — bez żadnego tekstu przed ani po:

{
  "severity": "KRYTYCZNY|POWAŻNY|UMIARKOWANY|NISKI",
  "confidence": <0-100>,
  "diagnosis": "<główna diagnoza, 1-2 zdania>",
  "likely_causes": ["<przyczyna 1>", "<przyczyna 2>", "<przyczyna 3>"],
  "immediate_actions": ["<działanie 1>", "<działanie 2>"],
  "technical_details": "<szczegóły techniczne, 2-3 zdania>",
  "estimated_cost": "<zakres w PLN, np. 300–800 PLN>",
  "dealer_required": <true|false>,
  "additional_checks": ["<sprawdzenie 1>", "<sprawdzenie 2>"]
}

Używaj języka polskiego. Bądź konkretny i techniczny.`

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (res.status === 401) throw new Error('Nieprawidłowy klucz API. Sprawdź go w Ustawieniach.')
    if (res.status === 429) throw new Error('Przekroczono limit zapytań. Poczekaj chwilę i spróbuj ponownie.')
    throw new Error(err.error?.message || `Błąd API: ${res.status}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text?.trim() || ''

  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Nieprawidłowa odpowiedź modelu. Spróbuj ponownie.')

  return JSON.parse(match[0])
}
