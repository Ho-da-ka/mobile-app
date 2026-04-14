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

function getCourseStartTime(booking: ParentHomeBooking, courses: ParentHomeCourse[]): string | undefined {
  const matchedCourse = courses.find((course) => course.id === booking.courseId)
  return matchedCourse?.startTime || booking.createdAt
}

function getWeekAttendance(
  bookings: ParentHomeBooking[],
  courses: ParentHomeCourse[],
  childId: number,
  now: Date = new Date()
): string {
  const currentWeekBookings = bookings.filter(
    (item) =>
      item.studentId === childId &&
      item.bookingStatus === 'BOOKED' &&
      isCurrentWeek(getCourseStartTime(item, courses), now)
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
  courses: ParentHomeCourse[],
  childId: number,
  now: Date = new Date()
): { value: string; hint: string; summary: string } {
  const unreadCount = messages.filter((item) => !item.read).length
  const pendingCheckin = bookings.filter(
    (item) =>
      item.studentId === childId &&
      item.bookingStatus === 'BOOKED' &&
      item.checkinStatus === 'PENDING' &&
      isCurrentWeek(getCourseStartTime(item, courses), now)
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

export function buildParentHomeDashboard(input: ParentHomeDashboardInput): ParentHomeDashboard {
  const now = new Date()
  const unreadCount = input.messages.filter((item) => !item.read).length
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
        label: '家长首页',
        title: '先绑定孩子',
        status: '绑定后即可查看成长摘要与快捷入口',
        meta: '当前没有可展示的孩子档案',
        unreadCount
      },
      metrics: [],
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

  const latestFitness = getLatestFitnessSignal(input.fitnessRecords)
  const todoState = buildTodoSummary(input.messages, input.bookings, input.courses, input.child.id, now)
  const latestUpdate = buildLatestUpdate(input)

  const metrics: ParentHomeMetric[] = [
    {
      key: 'attendance',
      label: '本周出勤',
      value: getWeekAttendance(input.bookings, input.courses, input.child.id, now),
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

  return {
    hero: {
      label: '家长首页',
      title: `${input.child.name} · 家庭服务首页`,
      status: input.overview?.goalFocus?.trim() || '最近训练与提醒已汇总到首页',
      meta: getNextCourseMeta(input.child, input.bookings, input.courses, now),
      unreadCount
    },
    metrics,
    primaryActions: PRIMARY_ACTIONS,
    secondaryActions,
    latestUpdate: {
      title: '最近动态',
      summary: latestUpdate.summary,
      caption: latestUpdate.caption,
      ctaLabel: '进入成长总览',
      ctaUrl: `/pages/parent/growth/index?studentId=${input.child.id}`
    },
    todo: {
      title: '待处理事项',
      summary: todoState.summary,
      caption: unreadCount > 0 ? '建议优先处理消息提醒' : '建议优先查看最新训练反馈',
      ctaLabel: unreadCount > 0 ? '查看站内消息' : '查看成长总览',
      ctaUrl: unreadCount > 0 ? '/pages/parent/messages/list' : `/pages/parent/growth/index?studentId=${input.child.id}`
    },
    emptyState: null
  }
}
