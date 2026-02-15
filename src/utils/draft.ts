const PREFIX = 'zf_mp_draft:'

export function loadDraft<T>(key: string, fallback: T): T {
  try {
    const raw = uni.getStorageSync(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveDraft<T>(key: string, value: T): void {
  uni.setStorageSync(PREFIX + key, JSON.stringify(value))
}

export function clearDraft(key: string): void {
  uni.removeStorageSync(PREFIX + key)
}
