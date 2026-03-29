<template>
  <view class="page">
    <view class="card hero-card">
      <view class="row between hero-row">
        <view>
          <view class="title">管理首页</view>
          <view class="sub-title" style="margin-top: 8rpx">{{ userSummary }}</view>
          <view class="sub-title" style="margin-top: 6rpx">最后刷新：{{ statsUpdatedAt || '未刷新' }}</view>
        </view>
        <u-button size="small" type="error" plain text="退出登录" @click="handleLogout" />
      </view>
    </view>

    <view class="card status-card">
      <view class="row between">
        <view>
          <view style="font-weight: 600">后端服务状态</view>
          <view class="sub-title" style="margin-top: 8rpx">{{ pingText }}</view>
        </view>
        <u-button size="small" type="primary" plain text="刷新" @click="refreshAll" />
      </view>
    </view>

    <view class="card">
      <view class="row between">
        <view>
          <view class="title-small">统计概览</view>
          <view class="sub-title" style="margin-top: 6rpx">便于快速确认当前业务数据规模</view>
        </view>
        <view class="sub-title">{{ statsLoading ? '统计中...' : '已更新' }}</view>
      </view>

      <view class="stats-grid">
        <view class="stat-item">
          <view class="stat-value">{{ stats.studentTotal }}</view>
          <view class="stat-label">学员总数</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ stats.courseTotal }}</view>
          <view class="stat-label">课程总数</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ stats.attendanceTotal }}</view>
          <view class="stat-label">考勤记录</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ stats.fitnessTotal }}</view>
          <view class="stat-label">体测记录</view>
        </view>
        <view class="stat-item wide">
          <view class="stat-value">{{ stats.trainingTotal }}</view>
          <view class="stat-label">训练记录</view>
        </view>
      </view>
    </view>

    <view class="card menu-card" @click="goStudents">
      <view class="title-small">学员管理</view>
      <view class="sub-title">查看、筛选、新增和编辑学员</view>
    </view>

    <view class="card menu-card" @click="goCourses">
      <view class="title-small">课程管理</view>
      <view class="sub-title">维护课程信息与课程状态</view>
    </view>

    <view class="card menu-card" @click="goCoaches">
      <view class="title-small">教练信息</view>
      <view class="sub-title">按课程数据汇总查看教练分布、课程数和授课方向</view>
    </view>

    <view class="card menu-card" @click="goAttendances">
      <view class="title-small">考勤管理</view>
      <view class="sub-title">登记课程出勤，并按日期范围查询</view>
    </view>

    <view class="card menu-card" @click="goFitness">
      <view class="title-small">体测管理</view>
      <view class="sub-title">记录体测结果，查看学员体测变化</view>
    </view>

    <view class="card menu-card" @click="goTraining">
      <view class="title-small">训练记录</view>
      <view class="sub-title">记录每次训练内容、强度、反馈和教练评语</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { verifyPublicPing } from '@/api/modules/auth'
import { listAttendances } from '@/api/modules/attendance'
import { listCourses } from '@/api/modules/courses'
import { listFitnessTests } from '@/api/modules/fitness'
import { listStudents } from '@/api/modules/students'
import { listTrainingRecords } from '@/api/modules/training'
import { clearAuth, getAuth, isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const pingText = ref('未知')
const statsLoading = ref(false)
const statsUpdatedAt = ref('')
const stats = reactive({
  studentTotal: 0,
  courseTotal: 0,
  attendanceTotal: 0,
  fitnessTotal: 0,
  trainingTotal: 0
})

const userSummary = computed(() => {
  const auth = getAuth()
  if (!auth) return '未登录'
  const roleLabel = auth.role === 'ADMIN' ? '管理员' : '教练'
  return `${auth.username}（${roleLabel}）`
})

function buildNowText() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

async function refreshPing() {
  try {
    const data = await verifyPublicPing()
    pingText.value = `${data.status} / ${data.time}`
  } catch (error) {
    pingText.value = '不可用'
    showError(error, '服务状态获取失败')
  }
}

async function refreshStats() {
  statsLoading.value = true
  try {
    const [students, courses, attendances, fitness, training] = await Promise.all([
      listStudents({ page: 0, size: 1 }),
      listCourses({ page: 0, size: 1 }),
      listAttendances({}),
      listFitnessTests({}),
      listTrainingRecords({})
    ])

    stats.studentTotal = students.totalElements || students.content.length
    stats.courseTotal = courses.totalElements || courses.content.length
    stats.attendanceTotal = attendances.length
    stats.fitnessTotal = fitness.length
    stats.trainingTotal = training.length
    statsUpdatedAt.value = buildNowText()
  } catch (error) {
    showError(error, '统计概览获取失败')
  } finally {
    statsLoading.value = false
  }
}

async function refreshAll() {
  await Promise.all([refreshPing(), refreshStats()])
}

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function goStudents() {
  uni.navigateTo({ url: '/pages/admin/students/list' })
}

function goCourses() {
  uni.navigateTo({ url: '/pages/admin/courses/list' })
}

function goCoaches() {
  uni.navigateTo({ url: '/pages/admin/coaches/list' })
}

function goAttendances() {
  uni.navigateTo({ url: '/pages/admin/attendances/list' })
}

function goFitness() {
  uni.navigateTo({ url: '/pages/admin/fitness/list' })
}

function goTraining() {
  uni.navigateTo({ url: '/pages/admin/training/list' })
}

function handleLogout() {
  clearAuth()
  uni.reLaunch({ url: '/pages/login/index' })
}

onLoad(() => {
  if (ensureLogin()) {
    refreshAll()
  }
})

onShow(() => {
  if (ensureLogin()) {
    refreshStats()
  }
})
</script>

<style scoped lang="scss">
.title-small {
  font-size: 30rpx;
  font-weight: 600;
}

.hero-card {
  background: linear-gradient(135deg, #ffffff 0%, #f1f8ff 100%);
}

.hero-row {
  align-items: flex-start;
}

.status-card {
  border: 1rpx solid #dbeafe;
}

.menu-card {
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  margin-top: 20rpx;
}

.stat-item {
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 20rpx;
  padding: 24rpx 20rpx;
}

.stat-item.wide {
  grid-column: span 2;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #0f172a;
}

.stat-label {
  margin-top: 8rpx;
  color: #64748b;
  font-size: 24rpx;
}
</style>
