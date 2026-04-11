<template>
  <view class="page">
    <view class="card">
      <view class="title">学生端首页</view>
      <view v-if="profile" class="sub-title" style="margin-top: 8rpx">
        你好，{{ profile.name }}（学号：{{ profile.studentNo }}）
      </view>
      <view v-else class="sub-title" style="margin-top: 8rpx">正在加载学生信息...</view>

      <view class="stats-grid" style="margin-top: 16rpx">
        <view class="stat-card">
          <view class="stat-label">我的课程</view>
          <view class="stat-value">{{ summary.courseCount }}</view>
        </view>
        <view class="stat-card">
          <view class="stat-label">训练记录</view>
          <view class="stat-value">{{ summary.trainingCount }}</view>
        </view>
        <view class="stat-card">
          <view class="stat-label">体测记录</view>
          <view class="stat-value">{{ summary.fitnessCount }}</view>
        </view>
      </view>

      <view class="form-actions">
        <u-button type="primary" text="我的课程" @click="goCourses" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button type="success" text="训练记录" @click="goTraining" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button text="体测记录" @click="goFitness" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button type="warning" plain text="刷新数据" :loading="loading" @click="loadSummary" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button type="error" plain text="退出登录" @click="handleLogout" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
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

const loading = ref(false)
const profile = ref<StudentProfile | null>(null)
const summary = reactive({
  courseCount: 0,
  trainingCount: 0,
  fitnessCount: 0
})

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

async function loadSummary() {
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
    summary.courseCount = courses.length
    summary.trainingCount = trainings.length
    summary.fitnessCount = fitnessTests.length
  } catch (error) {
    showError(error, '学生数据加载失败')
  } finally {
    loading.value = false
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
  loadSummary()
})

onShow(() => {
  loadSummary()
})
</script>

<style scoped lang="scss">
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.stat-card {
  background: #f8fafc;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 16rpx;
  text-align: center;
}

.stat-label {
  font-size: 24rpx;
  color: #6b7280;
}

.stat-value {
  margin-top: 8rpx;
  font-size: 36rpx;
  font-weight: 700;
}
</style>
