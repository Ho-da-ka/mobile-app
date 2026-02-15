import { clearAuth, getAuth } from '@/store/auth'
import type { ApiResponse } from '@/types/api'
import { getErrorMessage } from '@/utils/error'

const BASE_URL = (import.meta.env.VITE_BASE_URL as string) || 'http://localhost:8080'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD'

export interface RequestOptions {
  url: string
  method?: HttpMethod
  data?: unknown
  skipAuth?: boolean
}

function ensureLoginRedirect() {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]?.route || ''
  if (current !== 'pages/login/index') {
    uni.reLaunch({ url: '/pages/login/index' })
  }
}

export async function request<T>(options: RequestOptions): Promise<T> {
  const auth = getAuth()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (!options.skipAuth && auth?.basicToken) {
    headers.Authorization = `Basic ${auth.basicToken}`
  }

  return await new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data as UniApp.RequestOptions['data'],
      header: headers,
      success: (res) => {
        const status = Number(res.statusCode)
        const body = res.data as ApiResponse<T> | Record<string, unknown>

        if (status === 401) {
          clearAuth()
          ensureLoginRedirect()
          reject(new Error('登录状态已失效，请重新登录'))
          return
        }

        if (status < 200 || status >= 300) {
          const msg = (body as ApiResponse<T>)?.message || `请求失败（${status}）`
          reject(new Error(msg))
          return
        }

        if (body && typeof body === 'object' && 'success' in body) {
          if (!(body as ApiResponse<T>).success) {
            reject(new Error((body as ApiResponse<T>).message || '请求失败'))
            return
          }
          resolve((body as ApiResponse<T>).data)
          return
        }

        resolve(body as T)
      },
      fail: (error) => {
        reject(new Error(getErrorMessage(error, '网络请求失败，请检查服务是否启动')))
      }
    })
  })
}
