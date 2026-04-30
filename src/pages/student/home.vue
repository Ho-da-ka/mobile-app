<template>
  <view class="page">
    <!-- Header: Minimalist Greeting -->
    <view class="header">
      <view class="greeting">
        <text class="hi">你好,</text>
        <text class="name">{{ profile?.name || '学员' }}</text>
      </view>
      <view class="date-tag">{{ todayDisplay }}</view>
    </view>

    <!-- Top: Action Hub -->
    <view class="content">
      <StudentActionHub 
        v-if="dashboard"
        :progress="dashboard.progress"
        :today-course="dashboard.todayCourse"
        @action="handleCourseAction"
      />
      <view v-else-if="loading" class="loading-placeholder">
        <u-loading-icon color="#F97316" />
      </view>

      <!-- Middle: Feature Grid -->
      <view class="feature-grid">
        <StudentFeatureTile 
          title="我的课程" 
          icon="calendar" 
          color="#3B82F6" 
          @click="goCourses" 
        />
        <StudentFeatureTile 
          title="历史记录" 
          icon="order" 
          color="#8B5CF6" 
          @click="goTraining" 
        />
        <StudentFeatureTile 
          title="体测报告" 
          icon="file-text" 
          color="#10B981" 
          @click="goFitness" 
        />
      </view>

      <!-- Bottom: Subtle Footer -->
      <view class="footer-actions">
        <view class="action-item" @click="loadDashboard">
          <u-icon name="reload" size="32rpx" color="#94A3B8" />
          <text>刷新数据</text>
        </view>
        <view class="divider"></view>
        <view class="action-item" @click="handleLogout">
          <u-icon name="level" size="32rpx" color="#94A3B8" />
          <text>退出登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { logout } from '@/api/modules/auth'
import {
  getStudentProfile,
  listStudentCourses,
  listStudentFitnessTests,
  listStudentTrainingRecords,
  type StudentProfile
} from '@/api/modules/student'
import { getAuth, isLoggedIn } from '@/store/auth'
import { showError, showSuccess } from '@/utils/error'
import StudentActionHub from './components/StudentActionHub.vue'
import StudentFeatureTile from './components/StudentFeatureTile.vue'
import { buildStudentHomeDashboard } from '@/utils/student-home'
import type { StudentHomeDashboard } from '@/types/student-home'

const loading = ref(false)
const profile = ref<StudentProfile | null>(null)
const dashboard = ref<StudentHomeDashboard | null>(null)

const todayDisplay = computed(() => {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日`
})

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

async function loadDashboard() {
  if (!ensureLogin()) return
  loading.value = true
  try {
    const [profileData, courses, trainings, fitnessTests] = await Promise.all([
      getStudentProfile(),
      listStudentCourses(),
      listStudentTrainingRecords(),
      listStudentFitnessTests()
    ])
    profile.value = profileData
    dashboard.value = buildStudentHomeDashboard({
      courses,
      trainings,
      fitnessTests
    })
  } catch (error) {
    showError(error, '数据加载失败')
  } finally {
    loading.value = false
  }
}

function handleCourseAction(course: StudentHomeDashboard['todayCourse']) {
  if (course.status === 'none') {
    goCourses()
  } else {
    // Navigate to course detail/check-in
    uni.navigateTo({ url: `/pages/student/courses/detail?id=${course.id}` })
  }
}

function goCourses() {
  uni.navigateTo({ url: '/pages/student/courses/list' })
}

function goTraining() {
  uni.navigateTo({ url: '/pages/student/training/list' })
}

function goFitness() {
  uni.navigateTo({ url: '/pages/student/fitness/list' })
}

async function handleLogout() {
  try {
    const refreshToken = getAuth()?.refreshToken
    await logout(refreshToken)
    showSuccess('已退出登录')
  } catch (error) {
    showError(error, '退出登录失败')
  } finally {
    uni.reLaunch({ url: '/pages/login/index' })
  }
}

onLoad(() => {
  loadDashboard()
})

onShow(() => {
  loadDashboard()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #FFFFFF;
  padding: 0 32rpx 64rpx;
}

.header {
  padding: 60rpx 0 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  .greeting {
    display: flex;
    flex-direction: column;

    .hi {
      font-size: 28rpx;
      color: #64748B;
      margin-bottom: 4rpx;
    }

    .name {
      font-size: 48rpx;
      color: #0F172A;
      font-weight: 800;
    }
  }

  .date-tag {
    background: #F8FAFC;
    padding: 8rpx 24rpx;
    border-radius: 32rpx;
    font-size: 24rpx;
    color: #64748B;
    font-weight: 500;
  }
}

.loading-placeholder {
  height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-grid {
  display: flex;
  gap: 24rpx;
  margin-bottom: 80rpx;
}

.footer-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
  padding: 40rpx 0;

  .action-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 26rpx;
    color: #94A3B8;

    &:active {
      opacity: 0.7;
    }
  }

  .divider {
    width: 2rpx;
    height: 24rpx;
    background-color: #E2E8F0;
  }
}
</style>
