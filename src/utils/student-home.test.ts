import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildStudentHomeDashboard } from './student-home';
import type { StudentCourse, StudentTrainingRecord, StudentFitnessRecord } from '@/api/modules/student';

describe('student-home utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return empty dashboard when no data provided', () => {
    const data = {
      courses: [],
      trainings: [],
      fitnessTests: []
    };
    const result = buildStudentHomeDashboard(data);
    
    expect(result.progress).toBe(0);
    expect(result.todayCourse.status).toBe('none');
    expect(result.todayCourse.ctaLabel).toBe('今日休息');
    expect(result.stats).toHaveLength(3);
    expect(result.stats.find(s => s.key === 'courses')?.value).toBe('0');
  });

  it('should calculate monthly progress correctly', () => {
    // Mock current date to 2024-05-15
    const date = new Date('2024-05-15T10:00:00');
    vi.setSystemTime(date);

    const courses: Partial<StudentCourse>[] = [
      { 
        startTime: '2024-05-01T09:00:00', 
        bookingStatus: 'BOOKED', 
        checkinStatus: 'CHECKED_IN' 
      },
      { 
        startTime: '2024-05-10T09:00:00', 
        bookingStatus: 'BOOKED', 
        checkinStatus: 'PENDING' 
      },
      { 
        startTime: '2024-06-01T09:00:00', 
        bookingStatus: 'BOOKED', 
        checkinStatus: 'CHECKED_IN' 
      } // Next month, should be ignored
    ];

    const result = buildStudentHomeDashboard({
      courses: courses as StudentCourse[],
      trainings: [],
      fitnessTests: []
    });

    // 1 checked in out of 2 booked in May
    expect(result.progress).toBe(50);
  });

  it('should identify today upcoming course correctly', () => {
    const date = new Date('2024-05-15T08:00:00');
    vi.setSystemTime(date);

    const courses: Partial<StudentCourse>[] = [
      { 
        id: 1,
        name: 'Morning Yoga',
        startTime: '2024-05-15T09:00:00',
        venue: 'Room 101',
        bookingStatus: 'BOOKED',
        durationMinutes: 60
      }
    ];

    const result = buildStudentHomeDashboard({
      courses: courses as StudentCourse[],
      trainings: [],
      fitnessTests: []
    });

    expect(result.todayCourse.id).toBe(1);
    expect(result.todayCourse.status).toBe('upcoming');
    expect(result.todayCourse.ctaLabel).toBe('查看详情');
  });

  it('should identify today ongoing course correctly', () => {
    const date = new Date('2024-05-15T09:30:00');
    vi.setSystemTime(date);

    const courses: Partial<StudentCourse>[] = [
      { 
        id: 1,
        name: 'Morning Yoga',
        startTime: '2024-05-15T09:00:00',
        venue: 'Room 101',
        bookingStatus: 'BOOKED',
        durationMinutes: 90
      }
    ];

    const result = buildStudentHomeDashboard({
      courses: courses as StudentCourse[],
      trainings: [],
      fitnessTests: []
    });

    expect(result.todayCourse.status).toBe('ongoing');
    expect(result.todayCourse.ctaLabel).toBe('立即签到');
  });

  it('should identify today completed course correctly', () => {
    const date = new Date('2024-05-15T11:00:00');
    vi.setSystemTime(date);

    const courses: Partial<StudentCourse>[] = [
      { 
        id: 1,
        name: 'Morning Yoga',
        startTime: '2024-05-15T09:00:00',
        venue: 'Room 101',
        bookingStatus: 'BOOKED',
        durationMinutes: 90
      }
    ];

    const result = buildStudentHomeDashboard({
      courses: courses as StudentCourse[],
      trainings: [],
      fitnessTests: []
    });

    expect(result.todayCourse.status).toBe('completed');
    expect(result.todayCourse.ctaLabel).toBe('查看详情');
  });
});
