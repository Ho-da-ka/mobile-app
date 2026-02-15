export const GUARDIAN_PHONE_REGEX = /^$|^[0-9+\-]{6,20}$/

export function trimText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function isFutureDate(dateText: string): boolean {
  if (!dateText) return false
  const selected = new Date(`${dateText}T00:00:00`)
  if (Number.isNaN(selected.getTime())) return false
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)
  return selected > todayEnd
}

export function toPositiveInt(value: unknown, defaultValue: number): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return defaultValue
  return Math.floor(n)
}
