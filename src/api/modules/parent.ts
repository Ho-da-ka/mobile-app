import { request } from '@/api/http'
import type { AttendanceRecord, CourseStatus, FitnessTestRecord, StudentStatus } from '@/types/parent'

export interface ParentChild {
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

export interface ParentCourse {
  id: number
  courseCode: string
  name: string
  courseType: string
  coachName: string
  venue: string
  startTime: string
  durationMinutes: number
  status: CourseStatus
  description: string
  capacity: number
  bookedCount: number
  availableCount: number
}

export interface ParentBooking {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  bookingStatus: 'BOOKED' | 'CANCELED'
  courseCapacity: number
  bookingRemark: string
  checkinStatus: 'PENDING' | 'CHECKED_IN'
  checkinTime?: string
  createdAt?: string
  updatedAt?: string
}

export interface ParentMessage {
  id: number
  title: string
  content: string
  msgType: string
  read: boolean
  readAt?: string
  createdAt?: string
}

export interface CreateBookingPayload {
  studentId: number
  courseId: number
  remark?: string
}

export interface CreateCheckinPayload {
  bookingId: number
  attendanceDate?: string
  note?: string
}

export function listParentChildren(): Promise<ParentChild[]> {
  return request<ParentChild[]>({
    url: '/api/v1/parent/children',
    method: 'GET'
  })
}

export function listParentCourses(): Promise<ParentCourse[]> {
  return request<ParentCourse[]>({
    url: '/api/v1/parent/courses',
    method: 'GET'
  })
}

export function listParentBookings(): Promise<ParentBooking[]> {
  return request<ParentBooking[]>({
    url: '/api/v1/parent/bookings',
    method: 'GET'
  })
}

export function createParentBooking(payload: CreateBookingPayload): Promise<ParentBooking> {
  return request<ParentBooking>({
    url: '/api/v1/parent/bookings',
    method: 'POST',
    data: payload
  })
}

export function cancelParentBooking(id: number): Promise<ParentBooking> {
  return request<ParentBooking>({
    url: `/api/v1/parent/bookings/${id}`,
    method: 'DELETE'
  })
}

export function listParentCheckins(): Promise<AttendanceRecord[]> {
  return request<AttendanceRecord[]>({
    url: '/api/v1/parent/checkins',
    method: 'GET'
  })
}

export function createParentCheckin(payload: CreateCheckinPayload): Promise<AttendanceRecord> {
  return request<AttendanceRecord>({
    url: '/api/v1/parent/checkins',
    method: 'POST',
    data: payload
  })
}

export function listParentFitness(studentId?: number): Promise<FitnessTestRecord[]> {
  const query = studentId ? `?studentId=${studentId}` : ''
  return request<FitnessTestRecord[]>({
    url: `/api/v1/parent/fitness-tests${query}`,
    method: 'GET'
  })
}

export function listParentMessages(): Promise<ParentMessage[]> {
  return request<ParentMessage[]>({
    url: '/api/v1/parent/messages',
    method: 'GET'
  })
}

export function readParentMessage(id: number): Promise<ParentMessage> {
  return request<ParentMessage>({
    url: `/api/v1/parent/messages/${id}/read`,
    method: 'POST'
  })
}
