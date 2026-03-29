import { request } from '@/api/http'
import type { AttendanceRecord } from '@/types/api'

export interface AttendanceQuery {
  studentId?: number
  courseId?: number
  startDate?: string
  endDate?: string
}

export interface AttendanceCreatePayload {
  studentId: number
  courseId: number
  attendanceDate: string
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE'
  note: string
}

function buildQueryString(query: AttendanceQuery): string {
  const parts: string[] = []
  if (query.studentId) parts.push(`studentId=${query.studentId}`)
  if (query.courseId) parts.push(`courseId=${query.courseId}`)
  if (query.startDate) parts.push(`startDate=${encodeURIComponent(query.startDate)}`)
  if (query.endDate) parts.push(`endDate=${encodeURIComponent(query.endDate)}`)
  return parts.join('&')
}

export function listAttendances(query: AttendanceQuery): Promise<AttendanceRecord[]> {
  const search = buildQueryString(query)
  return request<AttendanceRecord[]>({
    url: `/api/v1/attendances${search ? `?${search}` : ''}`,
    method: 'GET'
  })
}

export function createAttendance(payload: AttendanceCreatePayload): Promise<AttendanceRecord> {
  return request<AttendanceRecord>({
    url: '/api/v1/attendances',
    method: 'POST',
    data: payload
  })
}
