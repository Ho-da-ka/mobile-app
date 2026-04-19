<template>
  <view class="page">
    <view class="summary-bar">
      <view class="summary-item">
        <text class="label">今日课程</text>
        <text class="value">{{ stats.todayCourses }}</text>
      </view>
      <view class="summary-item">
        <text class="label">待签到</text>
        <text class="value">{{ stats.pendingSignIns }}</text>
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
              <text>类型: {{ course.courseType }}</text>
              <text class="divider">|</text>
              <text>场地: {{ course.venue }}</text>
            </view>
          </view>
          <view class="card-actions">
            <u-button size="small" type="primary" plain text="录入体测" @click="goFitness" />
            <u-button size="small" type="primary" text="考勤管理" @click="goAttendances" />
          </view>
        </view>
      </template>
      <template v-else>
        <view style="padding: 40rpx; text-align: center; color: #9ca3af;">
          <text>所选日期无课程安排</text>
        </view>
      </template>
    </view>

    <view class="fab-btn" @click="goCourses">
      <text style="color: white; font-size: 40rpx">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { listCourses } from '@/api/modules/courses'
import type { Course } from '@/api/modules/courses'
import { getAuth, isLoggedIn, logout } from '@/store/auth'
import DateSlider from '@/components/date-slider/date-slider.vue'

const selectedDate = ref(new Date().toISOString().split('T')[0])
const allCourses = ref<Course[]>([])
const displayCourses = ref<Course[]>([])
const stats = reactive({ todayCourses: 0, pendingSignIns: 0 })

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
  // 假设格式为 "YYYY-MM-DD HH:mm:00"
  const parts = startTimeStr.split(' ')
  if (parts.length !== 2) return ''
  const timeParts = parts[1].split(':')
  const date = new Date()
  date.setHours(parseInt(timeParts[0], 10))
  date.setMinutes(parseInt(timeParts[1], 10) + durationMinutes)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function fetchAllCourses() {
  try {
    const res = await listCourses({ page: 0, size: 100 })
    allCourses.value = res.content || []
    
    // 统计今天的数据
    const today = new Date().toISOString().split('T')[0]
    const todayList = allCourses.value.filter(c => c.startTime && c.startTime.startsWith(today))
    stats.todayCourses = todayList.length
    // 简化处理，待签到数暂时用课程数模拟或设为0
    stats.pendingSignIns = todayList.length > 0 ? todayList.length * 5 : 0 
    
    filterCourses(selectedDate.value)
  } catch (e) {
    console.error('Failed to load courses', e)
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

function goAttendances() { uni.navigateTo({ url: '/pages/admin/attendances/list' }) }
function goFitness() { uni.navigateTo({ url: '/pages/admin/fitness/list' }) }
function goCourses() { uni.navigateTo({ url: '/pages/admin/courses/list' }) }

onLoad(() => { if (ensureLogin()) fetchAllCourses() })
onShow(() => { if (ensureLogin()) fetchAllCourses() })
</script>

<style scoped lang="scss">
.summary-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #3b82f6; 
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
    .status { font-size: 24rpx; padding: 4rpx 12rpx; border-radius: 8rpx; background: #dbeafe; color: #1d4ed8; }
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

.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 16rpx rgba(59,130,246,0.4);
  z-index: 99;
}
</style>