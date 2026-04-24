/**
 * Interpreta um timestamp vindo da API como Date.
 *
 * O backend envia alguns timestamps naive (sem timezone) — como o
 * `last_updated` gerado por `datetime.now()` no contêiner UTC. JS, por
 * padrão, interpreta ISO sem offset como horário LOCAL, o que gera um
 * deslocamento de 3h no Brasil. Aqui forçamos a interpretação como UTC
 * quando não há marcador de timezone.
 */
export function parseApiDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value !== 'string') return new Date(value)

  const hasTimezone = /([zZ])|([+-]\d{2}:?\d{2})$/.test(value)
  return new Date(hasTimezone ? value : value + 'Z')
}

/**
 * Formata uma string de data ISO ou timestamp para o padrão local (pt-BR).
 * @param {string|number|Date} value
 * @returns {string} Data e hora formatadas (ex: "26/03/2026 11:14")
 */
export const formatDateTime = (value) => {
  const date = parseApiDate(value)
  if (!date || isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

