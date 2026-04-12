import { request } from '@/api/http'
import type { PageResponse } from '@/types/api'

export interface Coach {
  id: number
  coachCode: string
  name: string
  gender: 'MALE' | 'FEMALE'
  phone: string
  specialty: string
  status: 'ACTIVE' | 'INACTIVE'
  remarks: string
  createdAt?: string
  updatedAt?: string
}

export interface CoachQuery {
  page: number
  size: number
  name?: string
  status?: string
}

export interface CoachCreatePayload {
  coachCode: string
  name: string
  gender: 'MALE' | 'FEMALE'
  phone: string
  specialty: string
  status: 'ACTIVE' | 'INACTIVE'
  remarks: string
}

export interface CoachUpdatePayload {
  name: string
  gender: 'MALE' | 'FEMALE'
  phone: string
  specialty: string
  status: 'ACTIVE' | 'INACTIVE'
  remarks: string
}

function buildQueryString(query: CoachQuery): string {
  const parts = [`page=${query.page}`, `size=${query.size}`]
  if (query.name) parts.push(`name=${encodeURIComponent(query.name)}`)
  if (query.status) parts.push(`status=${encodeURIComponent(query.status)}`)
  return parts.join('&')
}

export function listCoaches(query: CoachQuery): Promise<PageResponse<Coach>> {
  return request<PageResponse<Coach>>({
    url: `/api/v1/coaches?${buildQueryString(query)}`,
    method: 'GET'
  })
}

export function getCoach(id: number): Promise<Coach> {
  return request<Coach>({
    url: `/api/v1/coaches/${id}`,
    method: 'GET'
  })
}

export function createCoach(payload: CoachCreatePayload): Promise<Coach> {
  return request<Coach>({
    url: '/api/v1/coaches',
    method: 'POST',
    data: payload
  })
}

export function updateCoach(id: number, payload: CoachUpdatePayload): Promise<Coach> {
  return request<Coach>({
    url: `/api/v1/coaches/${id}`,
    method: 'PUT',
    data: payload
  })
}

export function deleteCoach(id: number): Promise<void> {
  return request<void>({
    url: `/api/v1/coaches/${id}`,
    method: 'DELETE'
  })
}

