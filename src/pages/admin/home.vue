<template>
  <view class="page">
    <!-- Hero Section -->
    <view class="hero-section">
      <view class="user-info">
        <view class="greeting">你好,</view>
        <view class="username">{{ username }}</view>
        <view class="role-tag">{{ roleLabel }}</view>
      </view>
      <view class="actions">
        <view class="logout-btn" @click="handleLogout">
          <u-icon name="arrow-left-circle" size="36rpx" color="#94A3B8"></u-icon>
          <text>退出</text>
        </view>
      </view>
    </view>

    <!-- Statistics Grid -->
    <view class="section-title">
      <text>数据概览</text>
      <text class="refresh-time" @click="refreshStats">
        {{ statsLoading ? '更新中...' : '同步于 ' + (statsUpdatedAt || '未知') }}
        <u-icon name="reload" size="24rpx" class="reload-icon" :class="{ rotating: statsLoading }"></u-icon>
      </text>
    </view>
    
    <view class="stats-grid">
      <AdminStatTile label="学员总数" :value="stats.studentTotal" />
      <AdminStatTile label="课程总数" :value="stats.courseTotal" />
      <AdminStatTile label="考勤记录" :value="stats.attendanceTotal" />
      <AdminStatTile label="体测记录" :value="stats.fitnessTotal" />
    </view>

    <!-- Menu Grid -->
    <view class="section-title">功能工作台</view>
    <view class="menu-grid">
      <AdminMenuTile 
        title="学员管理" 
        subtitle="档案与信息维护" 
        icon="account-fill" 
        @click="goStudents" 
      />
      <AdminMenuTile 
        title="课程管理" 
        subtitle="排课与状态控制" 
        icon="grid-fill" 
        @click="goCourses" 
      />
      <AdminMenuTile 
        title="教练信息" 
        subtitle="教练资质与分配" 
        icon="man-add-fill" 
        @click="goCoaches" 
      />
      <AdminMenuTile 
        title="考勤管理" 
        subtitle="出勤登记与查询" 
        icon="calendar-fill" 
        @click="goAttendances" 
      />
      <AdminMenuTile 
        title="体测管理" 
        subtitle="体适能数据记录" 
        icon="order" 
        @click="goFitness" 
      />
      <AdminMenuTile 
        title="训练记录" 
        subtitle="过程跟踪与评语" 
        icon="file-text" 
        @click="goTraining" 
      />
    </view>

    <!-- Service Status (Subtle) -->
    <view class="footer-status">
      <view class="status-dot" :class="pingStatus"></view>
      <text>系统服务: {{ pingText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AdminStatTile from './components/AdminStatTile.vue'
import AdminMenuTile from './components/AdminMenuTile.vue'
import { logout, verifyPublicPing } from '@/api/modules/auth'
import { listAttendances } from '@/api/modules/attendance'
import { listCourses } from '@/api/modules/courses'
import { listFitnessTests } from '@/api/modules/fitness'
import { listStudents } from '@/api/modules/students'
import { listTrainingRecords } from '@/api/modules/training'
import { getAuth, isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const pingText = ref('检测中...')
const statsLoading = ref(false)
const statsUpdatedAt = ref('')
const stats = reactive({
  studentTotal: 0,
  courseTotal: 0,
  attendanceTotal: 0,
  fitnessTotal: 0,
  trainingTotal: 0
})

const username = computed(() => getAuth()?.username || '用户')
const roleLabel = computed(() => {
  const auth = getAuth()
  if (!auth) return '访客'
  const roleLabelMap = {
    ADMIN: '系统管理员',
    COACH: '专业教练',
    STUDENT: '训练学员',
    PARENT: '家长'
  }
  return roleLabelMap[auth.role] || auth.role
})

const pingStatus = computed(() => {
  if (pingText.value.includes('OK') || pingText.value.includes('正常')) return 'status-ok'
  if (pingText.value === '不可用' || pingText.value === '异常') return 'status-error'
  return 'status-pending'
})

function buildNowText() {
  const date = new Date()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${hour}:${minute}`
}

async function refreshPing() {
  try {
    const data = await verifyPublicPing()
    pingText.value = `${data.status}`
  } catch (error) {
    pingText.value = '异常'
  }
}

async function refreshStats() {
  if (statsLoading.value) return
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
    showError(error, '同步数据失败')
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

function goStudents() { uni.navigateTo({ url: '/pages/admin/students/list' }) }
function goCourses() { uni.navigateTo({ url: '/pages/admin/courses/list' }) }
function goCoaches() { uni.navigateTo({ url: '/pages/admin/coaches/list' }) }
function goAttendances() { uni.navigateTo({ url: '/pages/admin/attendances/list' }) }
function goFitness() { uni.navigateTo({ url: '/pages/admin/fitness/list' }) }
function goTraining() { uni.navigateTo({ url: '/pages/admin/training/list' }) }

async function handleLogout() {
  const auth = getAuth()
  if (auth?.refreshToken) {
    await logout(auth.refreshToken)
  }
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
.page {
  min-height: 100vh;
  background-color: #F8FAFC;
  padding: 30rpx;
  padding-bottom: 60rpx;
}

.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 10rpx;
  margin-bottom: 20rpx;

  .user-info {
    .greeting {
      font-size: 26rpx;
      color: #64748B;
      margin-bottom: 4rpx;
    }
    .username {
      font-size: 44rpx;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 12rpx;
    }
    .role-tag {
      display: inline-block;
      padding: 6rpx 20rpx;
      background: #E0F2FE;
      color: #0369A1;
      font-size: 22rpx;
      font-weight: 600;
      border-radius: 100rpx;
    }
  }

  .logout-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    
    text {
      font-size: 22rpx;
      color: #94A3B8;
    }
  }
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0 10rpx;
  margin-bottom: 24rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #1E293B;

  .refresh-time {
    font-size: 22rpx;
    color: #94A3B8;
    font-weight: normal;
    display: flex;
    align-items: center;
    gap: 6rpx;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 60rpx;
}

.footer-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 30rpx 0;
  font-size: 22rpx;
  color: #94A3B8;

  .status-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    
    &.status-ok { background-color: #10B981; }
    &.status-error { background-color: #EF4444; }
    &.status-pending { background-color: #F59E0B; }
  }
}

.reload-icon {
  &.rotating {
    animation: rotate 1s linear infinite;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>


