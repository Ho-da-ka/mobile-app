export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AttendanceRecord {
  id: number
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

export interface TrainingRecord {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  trainingDate: string
  trainingContent: string
  durationMinutes: number
  intensityLevel: string
  performanceSummary: string
  coachComment: string
  createdAt?: string
  updatedAt?: string
}

export type RoleCode = 'ADMIN' | 'COACH'
