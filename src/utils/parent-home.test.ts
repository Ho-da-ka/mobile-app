import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildParentHomeDashboard,
  readStoredParentHomeStudentId,
  resolveCurrentParentStudentId,
  writeStoredParentHomeStudentId
} from './parent-home'

const storage = new Map<string, string>()

beforeEach(() => {
  storage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-04-14T09:00:00+08:00'))
  vi.stubGlobal('uni', {
    getStorageSync: vi.fn((key: string) => storage.get(key) ?? ''),
    setStorageSync: vi.fn((key: string, value: string) => {
      storage.set(key, value)
    }),
    removeStorageSync: vi.fn((key: string) => {
      storage.delete(key)
    })
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('child selection persistence', () => {
  it('uses a stored child id when the child is still bound', () => {
    writeStoredParentHomeStudentId(22)
    const children = [{ id: 11 }, { id: 22 }] as Array<{ id: number }>

    expect(readStoredParentHomeStudentId()).toBe(22)
    expect(resolveCurrentParentStudentId(children, readStoredParentHomeStudentId())).toBe(22)
  })

  it('clears an invalid stored child id and falls back to the first bound child', () => {
    writeStoredParentHomeStudentId(99)
    const children = [{ id: 11 }, { id: 22 }] as Array<{ id: number }>

    expect(resolveCurrentParentStudentId(children, readStoredParentHomeStudentId())).toBe(11)
    expect(storage.has('zf_parent_home_student_id')).toBe(false)
  })

  it('clears invalid stored values when reading the current child id', () => {
    storage.set('zf_parent_home_student_id', 'oops')

    expect(readStoredParentHomeStudentId()).toBeNull()
    expect(storage.has('zf_parent_home_student_id')).toBe(false)
  })
})

describe('buildParentHomeDashboard', () => {
  it('filters week-based attendance and pending checkins by course start time with fallback', () => {
    const dashboard = buildParentHomeDashboard({
      child: {
        id: 11,
        name: '乐乐',
        studentNo: 'S001',
        gender: 'MALE',
        birthDate: '2015-05-01',
        guardianName: '张女士',
        guardianPhone: '13800000000',
        status: 'ACTIVE'
      },
      overview: null,
      messages: [{ id: 1, title: '提醒', content: '请查看反馈', msgType: 'REMINDER', read: false, createdAt: '2026-04-13T09:00:00' }],
      bookings: [
        {
          id: 1,
          studentId: 11,
          studentName: '乐乐',
          courseId: 100,
          courseName: '周中课程',
          bookingStatus: 'BOOKED',
          courseCapacity: 20,
          bookingRemark: '',
          checkinStatus: 'CHECKED_IN',
          createdAt: '2026-04-06T08:00:00'
        },
        {
          id: 2,
          studentId: 11,
          studentName: '乐乐',
          courseId: 101,
          courseName: '下周课程',
          bookingStatus: 'BOOKED',
          courseCapacity: 20,
          bookingRemark: '',
          checkinStatus: 'PENDING',
          createdAt: '2026-04-14T08:00:00'
        },
        {
          id: 3,
          studentId: 11,
          studentName: '乐乐',
          courseId: 999,
          courseName: '缺课程',
          bookingStatus: 'BOOKED',
          courseCapacity: 20,
          bookingRemark: '',
          checkinStatus: 'PENDING',
          createdAt: '2026-04-13T08:00:00'
        }
      ],
      courses: [
        {
          id: 100,
          courseCode: 'C-100',
          name: '周中课程',
          courseType: 'GROUP',
          coachName: '李教练',
          venue: 'A馆',
          startTime: '2026-04-15T18:30:00',
          durationMinutes: 60,
          status: 'PLANNED',
          description: '',
          capacity: 20,
          bookedCount: 10,
          availableCount: 10
        },
        {
          id: 101,
          courseCode: 'C-101',
          name: '下周课程',
          courseType: 'GROUP',
          coachName: '李教练',
          venue: 'A馆',
          startTime: '2026-04-22T18:30:00',
          durationMinutes: 60,
          status: 'PLANNED',
          description: '',
          capacity: 20,
          bookedCount: 10,
          availableCount: 10
        }
      ],
      fitnessRecords: [
        {
          id: 5,
          studentId: 11,
          studentName: '乐乐',
          testDate: '2026-04-12',
          itemName: '坐位体前屈',
          testValue: 18,
          unit: 'cm',
          comment: '较上次稳定'
        }
      ]
    })

    expect(dashboard.metrics.map((item) => item.label)).toEqual(['本周出勤', '最新体测', '待处理事项'])
    expect(dashboard.metrics[0].value).toBe('1 / 2 次')
    expect(dashboard.todo.summary).toContain('本周还有 1 条签到待确认')
  })

  it('uses the approved quick action ordering and adds message badge for reminders', () => {
    const dashboard = buildParentHomeDashboard({
      child: {
        id: 11,
        name: '乐乐',
        studentNo: 'S001',
        gender: 'MALE',
        birthDate: '2015-05-01',
        guardianName: '张女士',
        guardianPhone: '13800000000',
        status: 'ACTIVE'
      },
      overview: null,
      messages: [{ id: 1, title: '提醒', content: '请查看反馈', msgType: 'REMINDER', read: false, createdAt: '2026-04-13T09:00:00' }],
      bookings: [],
      courses: [],
      fitnessRecords: []
    })

    expect(dashboard.primaryActions.map((item) => item.label)).toEqual(['课程预约', '成长总览', '签到记录', '我的孩子'])
    expect(dashboard.secondaryActions.map((item) => item.label)).toEqual(['体测记录', '预约记录', '站内消息'])
    expect(dashboard.secondaryActions.find((item) => item.key === 'messages')?.badge).toBe('1')
  })

  it('chooses the nearest future booked course for hero meta and ignores past bookings', () => {
    const dashboard = buildParentHomeDashboard({
      child: {
        id: 11,
        name: '乐乐',
        studentNo: 'S001',
        gender: 'MALE',
        birthDate: '2015-05-01',
        guardianName: '张女士',
        guardianPhone: '13800000000',
        status: 'ACTIVE'
      },
      overview: null,
      messages: [],
      bookings: [
        {
          id: 1,
          studentId: 11,
          studentName: '乐乐',
          courseId: 201,
          courseName: '过去课程',
          bookingStatus: 'BOOKED',
          courseCapacity: 20,
          bookingRemark: '',
          checkinStatus: 'CHECKED_IN',
          createdAt: '2026-04-10T08:00:00'
        },
        {
          id: 2,
          studentId: 11,
          studentName: '乐乐',
          courseId: 202,
          courseName: '最早将开始',
          bookingStatus: 'BOOKED',
          courseCapacity: 20,
          bookingRemark: '',
          checkinStatus: 'PENDING',
          createdAt: '2026-04-11T08:00:00'
        },
        {
          id: 3,
          studentId: 11,
          studentName: '乐乐',
          courseId: 203,
          courseName: '更晚将开始',
          bookingStatus: 'BOOKED',
          courseCapacity: 20,
          bookingRemark: '',
          checkinStatus: 'PENDING',
          createdAt: '2026-04-12T08:00:00'
        }
      ],
      courses: [
        {
          id: 201,
          courseCode: 'C-201',
          name: '过去课程',
          courseType: 'GROUP',
          coachName: '李教练',
          venue: 'A馆',
          startTime: '2026-04-13T18:30:00',
          durationMinutes: 60,
          status: 'COMPLETED',
          description: '',
          capacity: 20,
          bookedCount: 10,
          availableCount: 0
        },
        {
          id: 202,
          courseCode: 'C-202',
          name: '最早将开始',
          courseType: 'GROUP',
          coachName: '李教练',
          venue: 'A馆',
          startTime: '2026-04-15T18:30:00',
          durationMinutes: 60,
          status: 'PLANNED',
          description: '',
          capacity: 20,
          bookedCount: 10,
          availableCount: 10
        },
        {
          id: 203,
          courseCode: 'C-203',
          name: '更晚将开始',
          courseType: 'GROUP',
          coachName: '李教练',
          venue: 'A馆',
          startTime: '2026-04-16T18:30:00',
          durationMinutes: 60,
          status: 'PLANNED',
          description: '',
          capacity: 20,
          bookedCount: 10,
          availableCount: 10
        }
      ],
      fitnessRecords: []
    })

    expect(dashboard.hero.meta).toContain('2026-04-15 18:30')
  })

  it('falls back to the nearest available course when no future booked course exists', () => {
    const dashboard = buildParentHomeDashboard({
      child: {
        id: 11,
        name: '乐乐',
        studentNo: 'S001',
        gender: 'MALE',
        birthDate: '2015-05-01',
        guardianName: '张女士',
        guardianPhone: '13800000000',
        status: 'ACTIVE'
      },
      overview: null,
      messages: [],
      bookings: [
        {
          id: 1,
          studentId: 11,
          studentName: '乐乐',
          courseId: 201,
          courseName: '过去课程',
          bookingStatus: 'BOOKED',
          courseCapacity: 20,
          bookingRemark: '',
          checkinStatus: 'CHECKED_IN',
          createdAt: '2026-04-10T08:00:00'
        }
      ],
      courses: [
        {
          id: 301,
          courseCode: 'C-301',
          name: '最近可约',
          courseType: 'GROUP',
          coachName: '李教练',
          venue: 'A馆',
          startTime: '2026-04-15T18:30:00',
          durationMinutes: 60,
          status: 'PLANNED',
          description: '',
          capacity: 20,
          bookedCount: 10,
          availableCount: 10
        },
        {
          id: 302,
          courseCode: 'C-302',
          name: '更晚可约',
          courseType: 'GROUP',
          coachName: '李教练',
          venue: 'A馆',
          startTime: '2026-04-16T18:30:00',
          durationMinutes: 60,
          status: 'PLANNED',
          description: '',
          capacity: 20,
          bookedCount: 10,
          availableCount: 10
        }
      ],
      fitnessRecords: []
    })

    expect(dashboard.hero.meta).toContain('2026-04-15 18:30')
  })
})
