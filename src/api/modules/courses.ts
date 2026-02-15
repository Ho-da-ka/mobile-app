import { request } from '@/api/http'
import type { PageResponse } from '@/types/api'

export interface Course {
  id: number
  courseCode: string
  name: string
  courseType: string
  coachName: string
  venue: string
  startTime: string
  durationMinutes: number
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  description: string
  createdAt?: string
  updatedAt?: string
}

export interface CourseQuery {
  page: number
  size: number
  name?: string
  status?: string
}

export interface CourseCreatePayload {
  courseCode: string
  name: string
  courseType: string
  coachName: string
  venue: string
  startTime: string
  durationMinutes: number
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  description: string
}

export interface CourseUpdatePayload {
  name: string
  courseType: string
  coachName: string
  venue: string
  startTime: string
  durationMinutes: number
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  description: string
}

function buildQueryString(query: CourseQuery): string {
  const parts = [`page=${query.page}`, `size=${query.size}`]
  if (query.name) parts.push(`name=${encodeURIComponent(query.name)}`)
  if (query.status) parts.push(`status=${encodeURIComponent(query.status)}`)
  return parts.join('&')
}

export function listCourses(query: CourseQuery): Promise<PageResponse<Course>> {
  return request<PageResponse<Course>>({
    url: `/api/v1/courses?${buildQueryString(query)}`,
    method: 'GET'
  })
}

export function getCourse(id: number): Promise<Course> {
  return request<Course>({
    url: `/api/v1/courses/${id}`,
    method: 'GET'
  })
}

export function createCourse(payload: CourseCreatePayload): Promise<Course> {
  return request<Course>({
    url: '/api/v1/courses',
    method: 'POST',
    data: payload
  })
}

export function updateCourse(id: number, payload: CourseUpdatePayload): Promise<Course> {
  return request<Course>({
    url: `/api/v1/courses/${id}`,
    method: 'PUT',
    data: payload
  })
}
