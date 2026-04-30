import type {
  ParentHomeAction,
  ParentHomeBooking,
  ParentHomeChild,
  ParentHomeCourse,
  ParentHomeDashboard,
  ParentHomeDashboardInput,
  ParentHomeFitnessRecord,
  ParentHomeMetric,
  ParentHomeMessage
} from '@/types/parent-home'

const CURRENT_CHILD_KEY = 'zf_parent_home_student_id'

const PRIMARY_ACTIONS: ParentHomeAction[] = [
  { key: 'courses', label: '课程预约', hint: '查看可预约课程', url: '/pages/parent/courses/list', variant: 'primary' },
  { key: 'growth', label: '成长总览', hint: '查看阶段表现', url: '/pages/parent/growth/index', variant: 'primary' },
  { key: 'checkin', label: '签到记录', hint: '查看到课情况', url: '/pages/parent/checkin/list', variant: 'primary' },
  { key: 'children', label: '我的孩子', hint: '切换孩子档案', url: '/pages/parent/children/list', variant: 'primary' }
]

const SECONDARY_ACTIONS: ParentHomeAction[] = [
  { key: 'fitness', label: '体测记录', hint: '查看最新体测', url: '/pages/parent/fitness/list', variant: 'secondary' },
  { key: 'bookings', label: '预约记录', hint: '查看预约状态', url: '/pages/parent/bookings/list', variant: 'secondary' },
  { key: 'messages', label: '站内消息', hint: '查看通知提醒', url: '/pages/parent/messages/list', variant: 'secondary' }
]

function getStorageApi() {
  return uni
}

function formatDateTime(value?: string): string {
  if (!value) return '暂无近期课程'
  return value.replace('T', ' ').slice(0, 16)
}

function getWeekRange(now: Date = new Date()): { start: number; end: number } {
  const start = new Date(now)
  const dayOffset = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - dayOffset)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  return { start: start.getTime(), end: end.getTime() }
}

function parseTimestamp(value?: string): number | null {
  if (!value) return null
  const time = Date.parse(value)
  return Number.isFinite(time) ? time : null
}

function isCurrentWeek(value?: string, now: Date = new Date()): boolean {
  const time = parseTimestamp(value)
  if (time == null) return false

  const { start, end } = getWeekRange(now)
  return time >= start && time < end
}

function isFutureCourseStart(value?: string, now: Date = new Date()): boolean {
  const time = parseTimestamp(value)
  return time != null && time > now.getTime()
}

function getCourseStartTime(
  booking: ParentHomeBooking,
  courseStartLookup: Map<number, string>
): string | undefined {
  return courseStartLookup.get(booking.courseId) || booking.createdAt
}

function buildCourseStartLookup(courses: ParentHomeCourse[]): Map<number, string> {
  const lookup = new Map<number, string>()
  courses.forEach((course) => {
    if (course.startTime) {
      lookup.set(course.id, course.startTime)
    }
  })
  return lookup
}

function getWeekAttendance(
  bookings: ParentHomeBooking[],
  courseStartLookup: Map<number, string>,
  childId: number,
  now: Date = new Date()
): string {
  const currentWeekBookings = bookings.filter(
    (item) =>
      item.studentId === childId &&
      item.bookingStatus === 'BOOKED' &&
      isCurrentWeek(getCourseStartTime(item, courseStartLookup), now)
  )

  if (!currentWeekBookings.length) return '暂无记录'

  const checkedIn = currentWeekBookings.filter((item) => item.checkinStatus === 'CHECKED_IN').length
  return `${checkedIn} / ${currentWeekBookings.length} 次`
}

function getLatestFitnessSignal(fitnessRecords: ParentHomeFitnessRecord[]): { value: string; hint: string } {
  const latest = [...fitnessRecords].sort((a, b) => b.testDate.localeCompare(a.testDate))[0]
  if (!latest) {
    return { value: '暂无体测', hint: '等待新体测记录' }
  }

  return {
    value: latest.itemName,
    hint: latest.comment?.trim() || `${latest.testValue}${latest.unit}`
  }
}

function buildTodoSummary(
  messages: ParentHomeMessage[],
  bookings: ParentHomeBooking[],
  courseStartLookup: Map<number, string>,
  childId: number,
  now: Date = new Date()
): { value: string; hint: string; summary: string } {
  const unreadCount = messages.filter((item) => !item.read).length
  const pendingCheckin = bookings.filter(
    (item) =>
      item.studentId === childId &&
      item.bookingStatus === 'BOOKED' &&
      item.checkinStatus === 'PENDING' &&
      isCurrentWeek(getCourseStartTime(item, courseStartLookup), now)
  ).length

  const details: string[] = []
  if (unreadCount > 0) details.push(`有 ${unreadCount} 条新消息待确认`)
  if (pendingCheckin > 0) details.push(`本周还有 ${pendingCheckin} 条签到待确认`)

  return {
    value: `${unreadCount + pendingCheckin} 项`,
    hint: details[0] || '查看最新训练反馈',
    summary: ['查看最新训练反馈', ...details].join('，')
  }
}

function getNextCourseMeta(
  child: ParentHomeChild,
  bookings: ParentHomeBooking[],
  courses: ParentHomeCourse[],
  now: Date = new Date()
): string {
  const futureBookedCourses = bookings
    .filter((item) => item.studentId === child.id && item.bookingStatus === 'BOOKED')
    .map((booking) => {
      const matchedCourse = courses.find((course) => course.id === booking.courseId)
      return matchedCourse ? { booking, course: matchedCourse } : null
    })
    .filter((item): item is { booking: ParentHomeBooking; course: ParentHomeCourse } => Boolean(item))
    .filter((item) => isFutureCourseStart(item.course.startTime, now))
    .sort((left, right) => (parseTimestamp(left.course.startTime) ?? 0) - (parseTimestamp(right.course.startTime) ?? 0))

  const nextBookedCourse = futureBookedCourses[0]?.course
  if (nextBookedCourse) {
    return `下一节课 ${formatDateTime(nextBookedCourse.startTime)}`
  }

  const nextAvailableCourse = [...courses]
    .filter((course) => course.availableCount > 0 && isFutureCourseStart(course.startTime, now))
    .sort((left, right) => (parseTimestamp(left.startTime) ?? 0) - (parseTimestamp(right.startTime) ?? 0))[0]

  if (nextAvailableCourse) {
    return `下一节可约课程 ${formatDateTime(nextAvailableCourse.startTime)}`
  }

  return '暂无近期课程'
}

function buildLatestUpdate(input: ParentHomeDashboardInput): { summary: string; caption: string } {
  const evaluation = input.overview?.latestEvaluation
  if (evaluation?.parentReport?.trim()) {
    return {
      summary: evaluation.parentReport.trim(),
      caption: `阶段评估 · ${evaluation.cycleName}`
    }
  }

  const feedback = input.overview?.recentTrainingFeedback?.[0]
  if (feedback) {
    return {
      summary:
        feedback.aiSummary?.trim() ||
        feedback.highlightNote?.trim() ||
        feedback.nextStepSuggestion?.trim() ||
        '最近训练反馈已更新',
      caption: `训练反馈 · ${feedback.trainingDate}`
    }
  }

  return {
    summary: '最近还没有新的训练反馈，进入成长总览查看完整档案。',
    caption: '成长动态 · 暂无新记录'
  }
}

export function readStoredParentHomeStudentId(): number | null {
  const raw = getStorageApi().getStorageSync(CURRENT_CHILD_KEY)
  if (!raw) return null

  const parsed = Number(raw)
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed
  }

  clearStoredParentHomeStudentId()
  return null
}

export function writeStoredParentHomeStudentId(studentId: number): void {
  getStorageApi().setStorageSync(CURRENT_CHILD_KEY, String(studentId))
}

export function clearStoredParentHomeStudentId(): void {
  getStorageApi().removeStorageSync(CURRENT_CHILD_KEY)
}

export function resolveCurrentParentStudentId(
  children: Array<Pick<ParentHomeChild, 'id'>>,
  preferredId?: number | null
): number | null {
  if (preferredId != null && preferredId > 0 && children.some((child) => child.id === preferredId)) {
    return preferredId
  }

  if (preferredId != null && preferredId > 0) {
    clearStoredParentHomeStudentId()
  }

  if (!children.length) return null
  return children[0].id
}

export function buildParentHomeDashboard(
  input: ParentHomeDashboardInput,
  selectedDate: string = new Date().toISOString().split('T')[0]
): ParentHomeDashboard {
  const now = new Date()
  const unreadCount = input.messages.filter((item) => !item.read).length
  const courseStartLookup = buildCourseStartLookup(input.courses)
  // Components only render the dashboard view model; message badge decoration is resolved here.
  const secondaryActions = SECONDARY_ACTIONS.map((item) => {
    if (item.key === 'messages' && unreadCount > 0) {
      return {
        ...item,
        badge: String(unreadCount)
      }
    }

    return item
  })

  if (!input.child) {
    return {
      hero: {
        selectedDate,
        unreadCount
      },
      metrics: [],
      timeline: [],
      primaryActions: PRIMARY_ACTIONS,
      secondaryActions,
      latestUpdate: {
        title: '最近动态',
        summary: '绑定孩子后，这里会显示最近训练反馈和阶段评估。',
        caption: '成长动态 · 暂不可用',
        ctaLabel: '查看我的孩子',
        ctaUrl: '/pages/parent/children/list'
      },
      todo: {
        title: '待处理事项',
        summary: '先进入“我的孩子”确认绑定信息，再回来查看首页摘要。',
        caption: '首页引导',
        ctaLabel: '查看我的孩子',
        ctaUrl: '/pages/parent/children/list'
      },
      emptyState: {
        title: '还没有绑定孩子',
        description: '先进入“我的孩子”查看绑定信息，再回来查看成长摘要。',
        ctaLabel: '查看我的孩子',
        ctaUrl: '/pages/parent/children/list'
      }
    }
  }

  const studentId = input.child.id
  const latestFitness = getLatestFitnessSignal(input.fitnessRecords)
  const todoState = buildTodoSummary(input.messages, input.bookings, courseStartLookup, studentId, now)
  const latestUpdate = buildLatestUpdate(input)

  const metrics: ParentHomeMetric[] = [
    {
      key: 'attendance',
      label: '本周出勤',
      value: getWeekAttendance(input.bookings, courseStartLookup, studentId, now),
      hint: '优先按本周已预约与签到状态汇总',
      tone: 'teal'
    },
    {
      key: 'fitness',
      label: '最新体测',
      value: latestFitness.value,
      hint: latestFitness.hint,
      tone: 'blue'
    },
    {
      key: 'todo',
      label: '待处理事项',
      value: todoState.value,
      hint: todoState.hint,
      tone: 'amber'
    }
  ]

  // Timeline processing logic
  const timeline: import('@/types/parent-home').ParentHomeTimelineItem[] = []
  
  // Filter bookings for this child and this date
  const dayBookings = input.bookings.filter(booking => {
    if (booking.studentId !== studentId || booking.bookingStatus !== 'BOOKED') return false
    const startTime = getCourseStartTime(booking, courseStartLookup)
    return startTime && startTime.startsWith(selectedDate)
  })

  dayBookings.forEach(booking => {
    const startTimeStr = getCourseStartTime(booking, courseStartLookup)
    if (!startTimeStr) return
    
    const startTime = new Date(startTimeStr)
    const endTime = new Date(startTime.getTime() + 90 * 60 * 1000) // Assume 90 min duration
    const currentTime = now.getTime()
    
    let status: 'past' | 'upcoming' | 'ongoing' = 'upcoming'
    if (currentTime > endTime.getTime()) {
      status = 'past'
    } else if (currentTime >= startTime.getTime() && currentTime <= endTime.getTime()) {
      status = 'ongoing'
    }

    let reportUrl: string | undefined = undefined
    if (status === 'past' && booking.checkinStatus === 'CHECKED_IN') {
      reportUrl = `/pages/parent/growth/index?studentId=${studentId}&courseId=${booking.courseId}`
    }

    timeline.push({
      id: booking.courseId,
      time: startTimeStr.includes('T') ? startTimeStr.split('T')[1].slice(0, 5) : startTimeStr.slice(11, 16),
      date: selectedDate,
      title: booking.courseName || '未知课程',
      coach: (booking.coachName as string) || '待定教练',
      location: (booking.locationName as string) || '场馆待定',
      status,
      reportUrl
    })
  })

  // Sort timeline by time
  timeline.sort((a, b) => a.time.localeCompare(b.time))

  return {
    hero: {
      selectedDate,
      unreadCount
    },
    metrics,
    timeline,
    primaryActions: PRIMARY_ACTIONS,
    secondaryActions,
    latestUpdate: {
      title: '最近动态',
      summary: latestUpdate.summary,
      caption: latestUpdate.caption,
      ctaLabel: '进入成长总览',
      ctaUrl: `/pages/parent/growth/index?studentId=${studentId}`
    },
    todo: {
      title: '待处理事项',
      summary: todoState.summary,
      caption: unreadCount > 0 ? '建议优先处理消息提醒' : '建议优先查看最新训练反馈',
      ctaLabel: unreadCount > 0 ? '查看站内消息' : '查看成长总览',
      ctaUrl: unreadCount > 0 ? '/pages/parent/messages/list' : `/pages/parent/growth/index?studentId=${studentId}`
    },
    emptyState: null
  }
}
