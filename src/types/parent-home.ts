export interface ParentHomeMetric {
  key: 'attendance' | 'fitness' | 'todo'
  label: string
  value: string
  hint: string
  tone: 'teal' | 'blue' | 'amber'
}

export interface ParentHomeAction {
  key: string
  label: string
  hint: string
  url: string
  variant: 'primary' | 'secondary'
  badge?: string
}

export interface ParentHomeHero {
  label: string
  title: string
  status: string
  meta: string
  unreadCount: number
}

export interface ParentHomeActivity {
  title: string
  summary: string
  caption: string
  ctaLabel: string
  ctaUrl: string
}

export interface ParentHomeEmptyState {
  title: string
  description: string
  ctaLabel: string
  ctaUrl: string
}

export interface ParentHomeChild {
  id: number
  name: string
  [key: string]: unknown
}

export interface ParentHomeBooking {
  studentId: number
  courseId: number
  courseName: string
  bookingStatus: 'BOOKED' | 'CANCELED'
  checkinStatus: 'PENDING' | 'CHECKED_IN'
  createdAt?: string
  [key: string]: unknown
}

export interface ParentHomeCourse {
  id: number
  startTime: string
  availableCount: number
  name: string
  [key: string]: unknown
}

export interface ParentHomeMessage {
  read: boolean
  [key: string]: unknown
}

export interface ParentHomeFitnessRecord {
  testDate: string
  itemName: string
  testValue: number
  unit: string
  comment?: string
  [key: string]: unknown
}

export interface ParentHomeGrowthFeedback {
  trainingDate: string
  highlightNote?: string
  nextStepSuggestion?: string
  aiSummary?: string
  [key: string]: unknown
}

export interface ParentHomeGrowthEvaluation {
  cycleName: string
  parentReport?: string
  [key: string]: unknown
}

export interface ParentHomeGrowthOverview {
  goalFocus?: string
  recentTrainingFeedback: ParentHomeGrowthFeedback[]
  latestEvaluation?: ParentHomeGrowthEvaluation | null
  [key: string]: unknown
}

export interface ParentHomeDashboard {
  hero: ParentHomeHero
  metrics: ParentHomeMetric[]
  primaryActions: ParentHomeAction[]
  secondaryActions: ParentHomeAction[]
  latestUpdate: ParentHomeActivity
  todo: ParentHomeActivity
  emptyState: ParentHomeEmptyState | null
}

export interface ParentHomeDashboardInput {
  child: ParentHomeChild | null
  overview: ParentHomeGrowthOverview | null
  messages: ParentHomeMessage[]
  bookings: ParentHomeBooking[]
  courses: ParentHomeCourse[]
  fitnessRecords: ParentHomeFitnessRecord[]
}
