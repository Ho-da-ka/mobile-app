export type StudentStatus = 'ACTIVE' | 'INACTIVE'
export type CourseStatus = 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export interface AttendanceRecord {
  id: number
  bookingId?: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  attendanceDate: string
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE'
  note: string
  createdAt?: string
  updatedAt?: string
}

export interface FitnessTestRecord {
  id: number
  studentId: number
  studentName: string
  testDate: string
  itemName: string
  testValue: number
  unit: string
  comment: string
  createdAt?: string
  updatedAt?: string
}

