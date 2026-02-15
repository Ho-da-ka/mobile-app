import type { RoleCode } from '@/types/api'

const AUTH_KEY = 'zf_mp_auth'

export interface AuthPayload {
  username: string
  role: RoleCode
  basicToken: string
}

export function getAuth(): AuthPayload | null {
  try {
    const raw = uni.getStorageSync(AUTH_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthPayload
  } catch {
    return null
  }
}

export function setAuth(payload: AuthPayload): void {
  uni.setStorageSync(AUTH_KEY, JSON.stringify(payload))
}

export function clearAuth(): void {
  uni.removeStorageSync(AUTH_KEY)
}

export function isLoggedIn(): boolean {
  return !!getAuth()?.basicToken
}
