import { request } from '@/api/http'
import type { FitnessTestRecord } from '@/types/api'

export interface FitnessQuery {
  studentId?: number
}

export interface FitnessCreatePayload {
  studentId: number
  testDate: string
  itemName: string
  testValue: number
  unit: string
  comment: string
}

function buildQueryString(query: FitnessQuery): string {
  const parts: string[] = []
  if (query.studentId) parts.push(`studentId=${query.studentId}`)
  return parts.join('&')
}

export function listFitnessTests(query: FitnessQuery): Promise<FitnessTestRecord[]> {
  const search = buildQueryString(query)
  return request<FitnessTestRecord[]>({
    url: `/api/v1/fitness-tests${search ? `?${search}` : ''}`,
    method: 'GET'
  })
}

export function createFitnessTest(payload: FitnessCreatePayload): Promise<FitnessTestRecord> {
  return request<FitnessTestRecord>({
    url: '/api/v1/fitness-tests',
    method: 'POST',
    data: payload
  })
}
