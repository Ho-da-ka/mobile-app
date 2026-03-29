import { request } from '@/api/http'
import type { TrainingRecord } from '@/types/api'

export interface TrainingQuery {
  studentId?: number
  courseId?: number
  startDate?: string
  endDate?: string
}

export interface TrainingCreatePayload {
  studentId: number
  courseId: number
  trainingDate: string
  trainingContent: string
  durationMinutes: number
  intensityLevel: string
  performanceSummary: string
  coachComment: string
}

export type TrainingUpdatePayload = TrainingCreatePayload

function buildQueryString(query: TrainingQuery): string {
  const parts: string[] = []
  if (query.studentId) parts.push(`studentId=${query.studentId}`)
  if (query.courseId) parts.push(`courseId=${query.courseId}`)
  if (query.startDate) parts.push(`startDate=${encodeURIComponent(query.startDate)}`)
  if (query.endDate) parts.push(`endDate=${encodeURIComponent(query.endDate)}`)
  return parts.join('&')
}

export function listTrainingRecords(query: TrainingQuery): Promise<TrainingRecord[]> {
  const search = buildQueryString(query)
  return request<TrainingRecord[]>({
    url: `/api/v1/training-records${search ? `?${search}` : ''}`,
    method: 'GET'
  })
}

export function getTrainingRecord(id: number): Promise<TrainingRecord> {
  return request<TrainingRecord>({
    url: `/api/v1/training-records/${id}`,
    method: 'GET'
  })
}

export function createTrainingRecord(payload: TrainingCreatePayload): Promise<TrainingRecord> {
  return request<TrainingRecord>({
    url: '/api/v1/training-records',
    method: 'POST',
    data: payload
  })
}

export function updateTrainingRecord(id: number, payload: TrainingUpdatePayload): Promise<TrainingRecord> {
  return request<TrainingRecord>({
    url: `/api/v1/training-records/${id}`,
    method: 'PUT',
    data: payload
  })
}
