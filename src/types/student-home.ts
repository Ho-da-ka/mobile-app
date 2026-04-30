import type { StudentCourse, StudentTrainingRecord, StudentFitnessRecord } from '@/api/modules/student';

export interface StudentHomeDashboard {
  progress: number; // 0-100
  todayCourse: {
    id?: number;
    name: string;
    time: string;
    location: string;
    status: 'none' | 'upcoming' | 'ongoing' | 'completed';
    ctaLabel: string;
  };
  stats: {
    label: string;
    value: string;
    key: string;
  }[];
}

export interface StudentHomeData {
  courses: StudentCourse[];
  trainings: StudentTrainingRecord[];
  fitnessTests: StudentFitnessRecord[];
}
