import type { StudentHomeDashboard, StudentHomeData } from '@/types/student-home';
import type { StudentCourse } from '@/api/modules/student';

export function buildStudentHomeDashboard(data: StudentHomeData): StudentHomeDashboard {
  const { courses, trainings, fitnessTests } = data;
  const now = new Date();
  
  // Use local date components to avoid timezone shifts
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const todayStr = `${year}-${month}-${day}`;
  const currentMonthStr = `${year}-${month}`;

  // 1. Calculate progress for the current month
  const monthlyCourses = courses.filter(c => 
    c.startTime.startsWith(currentMonthStr) && c.bookingStatus === 'BOOKED'
  );
  const checkedInCourses = monthlyCourses.filter(c => c.checkinStatus === 'CHECKED_IN');
  const progress = monthlyCourses.length > 0 
    ? Math.round((checkedInCourses.length / monthlyCourses.length) * 100) 
    : 0;

  // 2. Today's Course Logic
  const todayCourses = courses
    .filter(c => c.startTime.startsWith(todayStr) && c.bookingStatus === 'BOOKED')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  let todayCourse: StudentHomeDashboard['todayCourse'] = {
    name: '暂无课程',
    time: '--:--',
    location: '无',
    status: 'none',
    ctaLabel: '今日休息'
  };

  if (todayCourses.length > 0) {
    const course = todayCourses[0];
    const startTime = new Date(course.startTime).getTime();
    const durationMs = (course.durationMinutes || 90) * 60 * 1000;
    const endTime = startTime + durationMs;
    const currentTime = now.getTime();

    let status: StudentHomeDashboard['todayCourse']['status'] = 'upcoming';
    let ctaLabel = '查看详情';

    if (currentTime < startTime) {
      status = 'upcoming';
      ctaLabel = '查看详情';
    } else if (currentTime >= startTime && currentTime < endTime) {
      status = 'ongoing';
      ctaLabel = '立即签到';
    } else {
      status = 'completed';
      ctaLabel = '查看详情';
    }

    const timeStr = course.startTime.split('T')[1]?.substring(0, 5) || '--:--';

    todayCourse = {
      id: course.id,
      name: course.name,
      time: timeStr,
      location: course.venue,
      status,
      ctaLabel
    };
  }

  // 3. Stats Logic
  const stats = [
    { label: '累计课程', value: courses.length.toString(), key: 'courses' },
    { label: '训练记录', value: trainings.length.toString(), key: 'trainings' },
    { label: '体能测试', value: fitnessTests.length.toString(), key: 'fitnessTests' }
  ];

  return {
    progress,
    todayCourse,
    stats
  };
}
