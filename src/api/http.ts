import { clearAuth, getAuth, setAuth } from '@/store/auth'
import type { ApiResponse, RoleCode } from '@/types/api'
import { getErrorMessage } from '@/utils/error'

const BASE_URL = (import.meta.env.VITE_BASE_URL as string) || 'http://localhost:8080'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD'

interface RefreshResult {
  tokenType: string
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  username: string
  role: RoleCode
}

export interface RequestOptions {
  url: string
  method?: HttpMethod
  data?: unknown
  skipAuth?: boolean
}

interface RawResponse<T> {
  statusCode: number
  body: ApiResponse<T> | Record<string, unknown>
}

let refreshingPromise: Promise<void> | null = null

function ensureLoginRedirect() {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]?.route || ''
  if (current !== 'pages/login/index') {
    uni.reLaunch({ url: '/pages/login/index' })
  }
}

function doRequest<T>(options: RequestOptions, headers: Record<string, string>): Promise<RawResponse<T>> {
  return new Promise<RawResponse<T>>((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data as UniApp.RequestOptions['data'],
      header: headers,
      success: (res) => {
        resolve({
          statusCode: Number(res.statusCode),
          body: res.data as ApiResponse<T> | Record<string, unknown>
        })
      },
      fail: (error) => {
        reject(new Error(getErrorMessage(error, '网络请求失败，请检查后端服务是否启动')))
      }
    })
  })
}

async function refreshAccessToken(): Promise<void> {
  const auth = getAuth()
  if (!auth?.refreshToken) {
    throw new Error('refresh token missing')
  }

  const response = await doRequest<RefreshResult>(
    {
      url: '/api/v1/auth/refresh',
      method: 'POST',
      data: { refreshToken: auth.refreshToken },
      skipAuth: true
    },
    { 'Content-Type': 'application/json' }
  )

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error('refresh failed')
  }

  const body = response.body as ApiResponse<RefreshResult>
  if (!body?.success || !body.data) {
    throw new Error(body?.message || 'refresh failed')
  }

  setAuth({
    username: body.data.username,
    role: body.data.role,
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken,
    tokenType: body.data.tokenType
  })
}

export async function request<T>(options: RequestOptions, retry = true): Promise<T> {
  const auth = getAuth()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (!options.skipAuth && auth?.accessToken) {
    headers.Authorization = `Bearer ${auth.accessToken}`
  }

  const response = await doRequest<T>(options, headers)
  const status = response.statusCode
  const body = response.body

  if (status === 401 && !options.skipAuth) {
    if (!retry) {
      clearAuth()
      ensureLoginRedirect()
      throw new Error('登录状态已失效，请重新登录')
    }

    try {
      if (!refreshingPromise) {
        refreshingPromise = refreshAccessToken().finally(() => {
          refreshingPromise = null
        })
      }
      await refreshingPromise
      return request<T>(options, false)
    } catch {
      clearAuth()
      ensureLoginRedirect()
      throw new Error('登录状态已失效，请重新登录')
    }
  }

  if (status < 200 || status >= 300) {
    const msg = (body as ApiResponse<T>)?.message || `请求失败（${status}）`
    throw new Error(msg)
  }

  if (body && typeof body === 'object' && 'success' in body) {
    if (!(body as ApiResponse<T>).success) {
      throw new Error((body as ApiResponse<T>).message || '请求失败')
    }
    return (body as ApiResponse<T>).data
  }

  return body as T
}

