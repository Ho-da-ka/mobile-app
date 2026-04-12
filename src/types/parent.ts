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

export interface ParentGrowthFeedback {
  id: number
  trainingDate: string
  trainingContent: string
  highlightNote?: string
  improvementNote?: string
  parentAction?: string
  nextStepSuggestion?: string
  aiSummary?: string
  parentReadAt?: string
}

export interface ParentGrowthEvaluation {
  cycleName: string
  attendanceRate: number
  fitnessSummary: string
  coachEvaluation: string
  nextStagePlan: string
  parentReport?: string
}

export interface ParentGrowthOverview {
  studentId: number
  studentName: string
  goalFocus?: string
  trainingTags?: string
  riskNotes?: string
  goalStartDate?: string
  goalEndDate?: string
  recentTrainingFeedback: ParentGrowthFeedback[]
  latestEvaluation?: ParentGrowthEvaluation | null
}

