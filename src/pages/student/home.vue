<template>
  <view class="page student-home">
    <view v-if="loading && !dashboard" class="state-container loading-state">
      <up-loading-icon text="同步训练数据..." vertical color="#F97316"></up-loading-icon>
    </view>
    
    <view v-else-if="errorText" class="state-container error-state">
      <view class="state-title">同步失败</view>
      <view class="state-copy">{{ errorText }}</view>
      <up-button type="warning" shape="circle" text="重新同步" @click="loadDashboard" />
    </view>

    <template v-else>
      <!-- Header: Minimalist Greeting -->
      <view class="header">
        <view class="greeting">
          <text class="hi">你好,</text>
          <text class="name">{{ profile?.name || '学员' }}</text>
        </view>
        <view class="date-tag">{{ todayDisplay }}</view>
      </view>

      <!-- Content Area -->
      <view class="content">
        <!-- Top: Action Hub -->
        <StudentActionHub 
          v-if="dashboard"
          :progress="dashboard.progress"
          :today-course="dashboard.todayCourse"
          @action="handleCourseAction"
        />

        <!-- Middle: Feature Grid -->
        <view class="feature-grid">
          <StudentFeatureTile 
            title="我的课程" 
            icon="calendar" 
            color="#3B82F6" 
            @click="goCourses" 
          />
          <StudentFeatureTile 
            title="训练记录" 
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
            <up-icon name="reload" size="32rpx" color="#94A3B8" />
            <text>刷新数据</text>
          </view>
          <view class="divider"></view>
          <view class="action-item" @click="handleLogout">
            <up-icon name="level" size="32rpx" color="#94A3B8" />
            <text>退出登录</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
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
const errorText = ref('')
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
  errorText.value = ''
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
    errorText.value = '无法连接到教务系统，请检查网络。'
    showError(error, '同步失败')
  } finally {
    loading.value = false
  }
}

onPullDownRefresh(async () => {
  await loadDashboard()
  uni.stopPullDownRefresh()
})

function handleCourseAction(course: StudentHomeDashboard['todayCourse']) {
  if (course.status === 'none') {
    goCourses()
  } else {
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
  if (isLoggedIn() && !dashboard.value) {
    loadDashboard()
  }
})
</script>

<style scoped lang="scss">
.student-home {
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

.state-container {
  min-height: 600rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40rpx;

  .state-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #1E293B;
    margin-bottom: 12rpx;
  }

  .state-copy {
    font-size: 26rpx;
    color: #64748B;
    margin-bottom: 40rpx;
  }
}

.feature-grid {
  display: flex;
  gap: 24rpx;
  margin-top: 40rpx;
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
