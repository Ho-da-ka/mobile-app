import type { RoleCode } from '@/types/api'

const AUTH_KEY = 'zf_mp_auth'
const AUTH_TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface AuthPayload {
  username: string
  role: RoleCode
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresAt: number
  issuedAt: number
}

export function getAuth(): AuthPayload | null {
  try {
    const raw = uni.getStorageSync(AUTH_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthPayload>
    if (!parsed?.accessToken || !parsed?.refreshToken || !parsed?.role || !parsed?.username) {
      clearAuth()
      return null
    }
    if (!parsed.expiresAt || parsed.expiresAt <= Date.now()) {
      clearAuth()
      return null
    }
    return parsed as AuthPayload
  } catch {
    clearAuth()
    return null
  }
}

export function setAuth(payload: Omit<AuthPayload, 'expiresAt' | 'issuedAt'>): void {
  const now = Date.now()
  const authPayload: AuthPayload = {
    ...payload,
    issuedAt: now,
    expiresAt: now + AUTH_TTL_MS
  }
  uni.setStorageSync(AUTH_KEY, JSON.stringify(authPayload))
}

export function clearAuth(): void {
  uni.removeStorageSync(AUTH_KEY)
}

export function isLoggedIn(): boolean {
  return !!getAuth()?.accessToken
}
