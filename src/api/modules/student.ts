import { request } from '@/api/http'
import type { CourseStatus, StudentStatus } from '@/types/parent'

export interface StudentProfile {
  id: number
  studentNo: string
  name: string
  gender: 'MALE' | 'FEMALE'
  birthDate: string
  guardianName: string
  guardianPhone: string
  status: StudentStatus
  createdAt?: string
  updatedAt?: string
}

export interface StudentCourse {
  id: number
  courseCode: string
  name: string
  courseType: string
  coachName: string
  venue: string
  startTime: string
  durationMinutes: number
  status: CourseStatus
  description?: string
  bookingStatus?: 'BOOKED' | 'CANCELED'
  checkinStatus?: 'PENDING' | 'CHECKED_IN'
}

export interface StudentTrainingRecord {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  trainingDate: string
  trainingContent: string
  durationMinutes: number
  intensityLevel?: string
  performanceSummary?: string
  coachComment?: string
  createdAt?: string
  updatedAt?: string
}

export interface StudentFitnessRecord {
  id: number
  studentId: number
  studentName: string
  testDate: string
  itemName: string
  testValue: number
  unit: string
  comment?: string
  createdAt?: string
  updatedAt?: string
}

export function getStudentProfile(): Promise<StudentProfile> {
  return request<StudentProfile>({
    url: '/api/v1/student/profile',
    method: 'GET'
  })
}

export function listStudentCourses(): Promise<StudentCourse[]> {
  return request<StudentCourse[]>({
    url: '/api/v1/student/courses',
    method: 'GET'
  })
}

export function listStudentTrainingRecords(): Promise<StudentTrainingRecord[]> {
  return request<StudentTrainingRecord[]>({
    url: '/api/v1/student/training-records',
    method: 'GET'
  })
}

export function listStudentFitnessTests(): Promise<StudentFitnessRecord[]> {
  return request<StudentFitnessRecord[]>({
    url: '/api/v1/student/fitness-tests',
    method: 'GET'
  })
}
