import { request } from '@/api/http'
import { clearAuth, setAuth } from '@/store/auth'
import type { RoleCode } from '@/types/api'
import CryptoJS from 'crypto-js'

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

const LOGIN_AES_KEY = import.meta.env.VITE_LOGIN_AES_KEY || 'ZFLoginCryptoKey2026ForDemo12345'

function buildIvWordArray() {
  const bytes = new Array<number>(16)
  for (let i = 0; i < 16; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256)
  }
  const ivHex = bytes.map((item) => item.toString(16).padStart(2, '0')).join('')
  return CryptoJS.enc.Hex.parse(ivHex)
}

function encryptLoginPassword(password: string): { encryptedPassword: string; iv: string } {
  const iv = buildIvWordArray()
  const key = CryptoJS.enc.Utf8.parse(LOGIN_AES_KEY)
  const encrypted = CryptoJS.AES.encrypt(password, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })

  return {
    encryptedPassword: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
    iv: CryptoJS.enc.Base64.stringify(iv)
  }
}

export async function verifyPublicPing(): Promise<PingData> {
  return request<PingData>({
    url: '/api/v1/public/ping',
    method: 'GET',
    skipAuth: true
  })
}

export async function loginWithJwt(username: string, password: string): Promise<AuthTokenData> {
  const encryptedPayload = encryptLoginPassword(password)
  const authData = await request<AuthTokenData>({
    url: '/api/v1/auth/login',
    method: 'POST',
    data: {
      username,
      encryptedPassword: encryptedPayload.encryptedPassword,
      iv: encryptedPayload.iv
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
