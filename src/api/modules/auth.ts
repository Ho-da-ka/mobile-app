import { request } from '@/api/http'
import { encodeBase64 } from '@/utils/base64'
import { clearAuth, setAuth } from '@/store/auth'
import type { RoleCode } from '@/types/api'

interface PingData {
  service: string
  time: string
  status: string
}

export async function verifyPublicPing(): Promise<PingData> {
  return request<PingData>({
    url: '/api/v1/public/ping',
    method: 'GET',
    skipAuth: true
  })
}

export async function loginWithBasic(username: string, password: string, role: RoleCode): Promise<void> {
  const basicToken = encodeBase64(`${username}:${password}`)
  setAuth({ username, role, basicToken })

  try {
    await request({
      url: '/api/v1/students?page=0&size=1',
      method: 'GET'
    })
  } catch (error) {
    clearAuth()
    throw error
  }
}

export function logout(): void {
  clearAuth()
}
