import { request } from '@/api/http'
import { clearAuth, setAuth } from '@/store/auth'
import type { RoleCode } from '@/types/api'

interface PingData {
  service: string
  time: string
  status: string
}

export interface AuthTokenData {
  tokenType: string
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  username: string
  role: RoleCode
}

export async function verifyPublicPing(): Promise<PingData> {
  return request<PingData>({
    url: '/api/v1/public/ping',
    method: 'GET',
    skipAuth: true
  })
}

export async function loginWithJwt(username: string, password: string): Promise<AuthTokenData> {
  const authData = await request<AuthTokenData>({
    url: '/api/v1/auth/login',
    method: 'POST',
    data: {
      username,
      password
    },
    skipAuth: true
  })

  setAuth({
    username: authData.username,
    role: authData.role,
    accessToken: authData.accessToken,
    refreshToken: authData.refreshToken,
    tokenType: authData.tokenType
  })

  return authData
}

export async function refreshToken(refreshToken: string): Promise<AuthTokenData> {
  return request<AuthTokenData>({
    url: '/api/v1/auth/refresh',
    method: 'POST',
    data: { refreshToken },
    skipAuth: true
  })
}

export async function logout(refreshToken?: string): Promise<void> {
  try {
    await request<void>({
      url: '/api/v1/auth/logout',
      method: 'POST',
      data: { refreshToken },
      skipAuth: true
    })
  } finally {
    clearAuth()
  }
}
