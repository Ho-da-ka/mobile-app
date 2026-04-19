<template>
  <view class="page">
    <view class="summary-bar">
      <view class="summary-item">
        <text class="label">我的课程</text>
        <text class="value">{{ allCourses.length }}</text>
      </view>
      <view class="summary-item" v-if="profile">
        <text class="label">学员姓名</text>
        <text class="value" style="font-size: 32rpx; margin-top: 8rpx;">{{ profile.name }}</text>
      </view>
      <view class="summary-item logout-item">
        <u-button size="small" type="error" plain text="退出" @click="handleLogout" />
      </view>
    </view>

    <date-slider v-model="selectedDate" :events="courseDates" @change="filterCourses" />

    <view class="schedule-stream">
      <template v-if="displayCourses.length > 0">
        <view class="course-card" v-for="course in displayCourses" :key="course.id">
          <view class="card-header">
            <view class="time">{{ formatTime(course.startTime) }} - {{ calculateEndTime(course.startTime, course.durationMinutes) }}</view>
            <view class="status">{{ course.status }}</view>
          </view>
          <view class="card-body">
            <view class="course-name">{{ course.name }}</view>
            <view class="course-info">
              <text>教练: {{ course.coachName }}</text>
              <text class="divider">|</text>
              <text>场地: {{ course.venue }}</text>
            </view>
          </view>
          <view class="card-actions">
            <u-button size="small" type="primary" text="查看详情" @click="goCourseDetail(course.id)" />
          </view>
        </view>
      </template>
      <template v-else>
        <view style="padding: 40rpx; text-align: center; color: #9ca3af;">
          <text>所选日期无课程安排，好好休息吧</text>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getStudentProfile, listStudentCourses } from '@/api/modules/student'
import type { StudentProfile, StudentCourse } from '@/api/modules/student'
import { getAuth, isLoggedIn, logout } from '@/store/auth'
import DateSlider from '@/components/date-slider/date-slider.vue'

const selectedDate = ref(new Date().toISOString().split('T')[0])
const allCourses = ref<StudentCourse[]>([])
const displayCourses = ref<StudentCourse[]>([])
const profile = ref<StudentProfile | null>(null)

const courseDates = computed(() => {
  const dates = new Set<string>()
  allCourses.value.forEach(c => {
    if (c.startTime) {
      dates.add(c.startTime.split(' ')[0])
    }
  })
  return Array.from(dates)
})

function formatTime(timeStr: string) {
  if (!timeStr) return ''
  return timeStr.split(' ')[1]?.substring(0, 5) || timeStr
}

function calculateEndTime(startTimeStr: string, durationMinutes: number) {
  if (!startTimeStr || !durationMinutes) return ''
  const parts = startTimeStr.split(' ')
  if (parts.length !== 2) return ''
  const timeParts = parts[1].split(':')
  const date = new Date()
  date.setHours(parseInt(timeParts[0], 10))
  date.setMinutes(parseInt(timeParts[1], 10) + durationMinutes)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function loadData() {
  try {
    profile.value = await getStudentProfile()
    const courses = await listStudentCourses()
    allCourses.value = courses || []
    filterCourses(selectedDate.value)
  } catch (e) {
    console.error('Failed to load student data', e)
  }
}

function filterCourses(date: string) {
  displayCourses.value = allCourses.value.filter(c => c.startTime && c.startTime.startsWith(date))
}

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

async function handleLogout() {
  const refreshToken = getAuth()?.refreshToken
  if (refreshToken) {
    await logout(refreshToken)
  }
  uni.reLaunch({ url: '/pages/login/index' })
}

function goCourseDetail(id: number) {
  uni.navigateTo({ url: '/pages/student/courses/list' })
}

onLoad(() => { if (ensureLogin()) loadData() })
onShow(() => { if (ensureLogin()) loadData() })
</script>

<style scoped lang="scss">
.summary-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #10b981; /* 绿色系给学生端以示区分 */
  color: #fff;
  padding: 30rpx 0;
  
  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    .label { font-size: 24rpx; opacity: 0.9; margin-bottom: 8rpx; }
    .value { font-size: 40rpx; font-weight: bold; }
  }
  
  .logout-item {
    margin-left: auto;
    margin-right: 20rpx;
  }
}

.schedule-stream {
  padding: 24rpx;
}

.course-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e5e7eb;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .time { font-size: 32rpx; font-weight: bold; color: #111827; }
    .status { font-size: 24rpx; padding: 4rpx 12rpx; border-radius: 8rpx; background: #d1fae5; color: #047857; }
  }

  .course-name { font-size: 30rpx; font-weight: 500; margin-bottom: 12rpx; }
  .course-info { font-size: 26rpx; color: #6b7280; margin-bottom: 24rpx; }
  .divider { margin: 0 12rpx; color: #d1d5db; }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16rpx;
    border-top: 1rpx solid #f3f4f6;
    padding-top: 16rpx;
  }
}
</style>