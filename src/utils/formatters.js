/**
 * Formata uma string de data ISO ou timestamp para o padrão local (pt-BR).
 * @param {string|number|Date} value
 * @returns {string} Data e hora formatadas (ex: "26/03/2026 11:14")
 */
export const formatDateTime = (value) => {
  if (!value) return ''
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )
}
