<template>
  <view class="page parent-home">
    <view v-if="loading" class="state-card loading-state">
      <u-loading-icon text="数据加载中..." vertical></u-loading-icon>
    </view>
    
    <view v-else-if="errorText" class="state-card error-state">
      <view class="state-title">加载失败</view>
      <view class="state-copy">{{ errorText }}</view>
      <u-button type="primary" text="重新加载" @click="loadHome(currentStudentId)" />
    </view>
    
    <view v-else-if="dashboard.emptyState" class="state-card empty-state">
      <view class="state-title">{{ dashboard.emptyState.title }}</view>
      <view class="state-copy">{{ dashboard.emptyState.description }}</view>
      <u-button type="primary" :text="dashboard.emptyState.ctaLabel" @click="navigate(dashboard.emptyState.ctaUrl)" />
    </view>

    <template v-else>
      <!-- Sticky Header -->
      <view class="header-sticky">
        <!-- Child Selector -->
        <view v-if="children.length > 1" class="child-selector">
          <scroll-view scroll-x class="child-scroll" :show-scrollbar="false">
            <view class="child-list">
              <view 
                v-for="child in children" 
                :key="child.id"
                class="child-item"
                :class="{ active: child.id === currentStudentId }"
                @tap="handleSelectChild(child.id)"
              >
                {{ child.name }}
              </view>
            </view>
          </scroll-view>
        </view>
        
        <!-- Date Strip -->
        <ParentDateStrip 
          :selected-date="selectedDate" 
          @select="handleDateSelect" 
        />
      </view>

      <!-- Asset Overview / Metrics -->
      <view class="asset-overview">
        <view v-for="metric in dashboard.metrics" :key="metric.key" class="asset-item">
          <text class="asset-label">{{ metric.label }}</text>
          <text class="asset-value" :class="metric.tone">{{ metric.value }}</text>
        </view>
      </view>

      <!-- Timeline Content -->
      <view class="timeline-container">
        <view v-if="dashboard.timeline.length > 0" class="timeline-list">
          <TimelineItem 
            v-for="item in dashboard.timeline" 
            :key="item.id" 
            :item="item" 
          />
        </view>
        <view v-else class="timeline-empty">
          <view class="empty-icon">📅</view>
          <text class="empty-text">今日暂无日程安排</text>
          <u-button 
            v-if="dashboard.todo.ctaUrl" 
            type="primary" 
            plain 
            size="small" 
            :text="dashboard.todo.ctaLabel" 
            @click="navigate(dashboard.todo.ctaUrl)" 
          />
        </view>
      </view>

      <!-- Bottom Actions -->
      <view class="footer-section">
        <view class="action-grid">
          <view 
            v-for="action in [...dashboard.primaryActions, ...dashboard.secondaryActions]" 
            :key="action.key"
            class="action-item"
            @tap="navigate(action.url)"
          >
            <view class="action-icon-placeholder"></view>
            <text class="action-label">{{ action.label }}</text>
            <view v-if="action.badge" class="action-badge">{{ action.badge }}</view>
          </view>
        </view>
        
        <view class="system-actions">
          <text class="system-btn" @tap="loadHome(currentStudentId)">刷新数据</text>
          <text class="system-divider">|</text>
          <text class="system-btn" @tap="handleLogout">退出登录</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { logout } from '@/api/modules/auth'
import {
  getParentGrowthOverview,
  listParentBookings,
  listParentChildren,
  listParentCourses,
  listParentFitness,
  listParentMessages,
  type ParentBooking,
  type ParentChild,
  type ParentCourse,
  type ParentMessage
} from '@/api/modules/parent'
import { getAuth, isLoggedIn } from '@/store/auth'
import type { FitnessTestRecord, ParentGrowthOverview } from '@/types/parent'
import {
  buildParentHomeDashboard,
  readStoredParentHomeStudentId,
  resolveCurrentParentStudentId,
  writeStoredParentHomeStudentId
} from '@/utils/parent-home'
import { showError, showSuccess } from '@/utils/error'

// New Components
import ParentDateStrip from './components/ParentDateStrip.vue'
import TimelineItem from './components/TimelineItem.vue'

const loading = ref(false)
const errorText = ref('')
const children = ref<ParentChild[]>([])
const currentStudentId = ref<number | null>(null)
const messages = ref<ParentMessage[]>([])
const bookings = ref<ParentBooking[]>([])
const courses = ref<ParentCourse[]>([])
const fitnessRecords = ref<FitnessTestRecord[]>([])
const overview = ref<ParentGrowthOverview | null>(null)

// Current date state
const selectedDate = ref(new Date().toISOString().split('T')[0])

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

const currentChild = computed(() => children.value.find((item) => item.id === currentStudentId.value) || null)

const dashboard = computed(() =>
  buildParentHomeDashboard({
    child: currentChild.value,
    overview: overview.value,
    messages: messages.value,
    bookings: bookings.value,
    courses: courses.value,
    fitnessRecords: fitnessRecords.value
  }, selectedDate.value)
)

async function loadHome(preferredStudentId?: number | null) {
  if (!ensureLogin()) return

  loading.value = true
  errorText.value = ''

  try {
    const childList = await listParentChildren()
    children.value = childList

    const resolvedId = resolveCurrentParentStudentId(childList, preferredStudentId ?? readStoredParentHomeStudentId())
    currentStudentId.value = resolvedId

    if (resolvedId) {
      writeStoredParentHomeStudentId(resolvedId)
    }

    const [messageRows, bookingRows, courseRows, fitnessRows, growth] = await Promise.all([
      listParentMessages(),
      listParentBookings(),
      listParentCourses(),
      resolvedId ? listParentFitness(resolvedId) : Promise.resolve([]),
      resolvedId ? getParentGrowthOverview(resolvedId) : Promise.resolve(null)
    ])

    messages.value = messageRows
    bookings.value = bookingRows
    courses.value = courseRows
    fitnessRecords.value = fitnessRows
    overview.value = growth
  } catch (error) {
    errorText.value = '请检查网络后重试。'
    showError(error, '加载失败')
  } finally {
    loading.value = false
  }
}

function handleDateSelect(date: string) {
  selectedDate.value = date
}

function navigate(url: string) {
  uni.navigateTo({ url })
}

function handleSelectChild(studentId: number) {
  if (studentId === currentStudentId.value) return
  loadHome(studentId)
}

async function handleLogout() {
  try {
    await logout(getAuth()?.refreshToken)
    showSuccess('已退出登录')
  } catch (error) {
    showError(error, '退出登录失败')
  } finally {
    uni.reLaunch({ url: '/pages/login/index' })
  }
}

onLoad(() => {
  loadHome()
})

onShow(() => {
  if (ensureLogin()) {
    loadHome(currentStudentId.value)
  }
})
</script>

<style scoped lang="scss">
.parent-home {
  min-height: 100vh;
  background-color: #FFFFFF;
  padding-bottom: 60rpx;
}

/* Header Sticky */
.header-sticky {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #FFFFFF;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.child-selector {
  padding: 20rpx 24rpx 10rpx;
  background-color: #FFFFFF;
}

.child-scroll {
  width: 100%;
}

.child-list {
  display: flex;
  gap: 16rpx;
  padding-bottom: 10rpx;
}

.child-item {
  padding: 8rpx 24rpx;
  background-color: #F3F4F6;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #4B5563;
  white-space: nowrap;
  
  &.active {
    background-color: #2563EB;
    color: #FFFFFF;
    font-weight: 600;
  }
}

/* Asset Overview */
.asset-overview {
  display: flex;
  justify-content: space-around;
  padding: 30rpx 24rpx;
  margin: 20rpx 24rpx;
  background-color: #F9FAFB;
  border-radius: 16rpx;
}

.asset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.asset-label {
  font-size: 24rpx;
  color: #6B7280;
}

.asset-value {
  font-size: 30rpx;
  font-weight: 700;
  
  &.teal { color: #0D9488; }
  &.blue { color: #2563EB; }
  &.amber { color: #D97706; }
}

/* Timeline Container */
.timeline-container {
  padding: 20rpx 0;
}

.timeline-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  gap: 20rpx;
  
  .empty-icon {
    font-size: 80rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #9CA3AF;
    margin-bottom: 20rpx;
  }
}

/* Footer Section */
.footer-section {
  margin-top: 40rpx;
  padding: 0 24rpx;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  padding: 30rpx 0;
  border-top: 1rpx solid #F3F4F6;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  position: relative;
}

.action-icon-placeholder {
  width: 48rpx;
  height: 48rpx;
  background-color: #E5E7EB;
  border-radius: 12rpx;
}

.action-label {
  font-size: 22rpx;
  color: #4B5563;
}

.action-badge {
  position: absolute;
  top: -10rpx;
  right: 20rpx;
  background-color: #EF4444;
  color: #FFFFFF;
  font-size: 18rpx;
  padding: 2rpx 8rpx;
  border-radius: 20rpx;
}

.system-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24rpx;
  margin-top: 40rpx;
  padding-bottom: 40rpx;
}

.system-btn {
  font-size: 24rpx;
  color: #9CA3AF;
}

.system-divider {
  color: #E5E7EB;
  font-size: 20rpx;
}

/* State Cards */
.state-card {
  margin: 40rpx 24rpx;
  padding: 60rpx 40rpx;
  background-color: #F9FAFB;
  border-radius: 24rpx;
  text-align: center;
}

.state-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16rpx;
}

.state-copy {
  font-size: 26rpx;
  color: #6B7280;
  margin-bottom: 32rpx;
}
</style>
