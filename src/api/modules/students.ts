import { request } from '@/api/http'
import type { PageResponse } from '@/types/api'

export interface Student {
  id: number
  studentNo: string
  name: string
  gender: 'MALE' | 'FEMALE'
  birthDate: string
  guardianName: string
  guardianPhone: string
  status: 'ACTIVE' | 'INACTIVE'
  remarks: string
  createdAt?: string
  updatedAt?: string
}

export interface StudentQuery {
  page: number
  size: number
  name?: string
  status?: string
}

export interface StudentCreatePayload {
  studentNo: string
  name: string
  gender: 'MALE' | 'FEMALE'
  birthDate: string
  guardianName: string
  guardianPhone: string
  status: 'ACTIVE' | 'INACTIVE'
  remarks: string
}

export interface StudentUpdatePayload {
  name: string
  gender: 'MALE' | 'FEMALE'
  birthDate: string
  guardianName: string
  guardianPhone: string
  status: 'ACTIVE' | 'INACTIVE'
  remarks: string
}

function buildQueryString(query: StudentQuery): string {
  const parts = [`page=${query.page}`, `size=${query.size}`]
  if (query.name) parts.push(`name=${encodeURIComponent(query.name)}`)
  if (query.status) parts.push(`status=${encodeURIComponent(query.status)}`)
  return parts.join('&')
}

export function listStudents(query: StudentQuery): Promise<PageResponse<Student>> {
  return request<PageResponse<Student>>({
    url: `/api/v1/students?${buildQueryString(query)}`,
    method: 'GET'
  })
}

export function getStudent(id: number): Promise<Student> {
  return request<Student>({
    url: `/api/v1/students/${id}`,
    method: 'GET'
  })
}

export function createStudent(payload: StudentCreatePayload): Promise<Student> {
  return request<Student>({
    url: '/api/v1/students',
    method: 'POST',
    data: payload
  })
}

export function updateStudent(id: number, payload: StudentUpdatePayload): Promise<Student> {
  return request<Student>({
    url: `/api/v1/students/${id}`,
    method: 'PUT',
    data: payload
  })
}
