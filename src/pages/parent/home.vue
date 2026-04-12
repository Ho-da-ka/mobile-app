<template>
  <view class="page">
    <view class="card">
      <view class="title">家长端首页</view>
      <view class="sub-title" style="margin-top: 8rpx">查看孩子、预约课程、签到与消息</view>

      <view class="stats-grid">
        <view class="stat-item">
          <view class="stat-label">已绑定学员</view>
          <view class="stat-value">{{ stats.children }}</view>
        </view>
        <view class="stat-item">
          <view class="stat-label">可约课程</view>
          <view class="stat-value">{{ stats.courses }}</view>
        </view>
        <view class="stat-item">
          <view class="stat-label">预约记录</view>
          <view class="stat-value">{{ stats.bookings }}</view>
        </view>
        <view class="stat-item">
          <view class="stat-label">未读消息</view>
          <view class="stat-value">{{ stats.unreadMessages }}</view>
        </view>
      </view>

      <view class="row gap" style="margin-top: 16rpx">
        <u-button type="primary" text="刷新数据" @click="refreshSummary" />
        <u-button text="退出登录" @click="handleLogout" />
      </view>
    </view>

    <view class="card">
      <view class="title" style="font-size: 30rpx">常用功能</view>
      <view class="actions-grid">
        <u-button type="primary" text="我的孩子" @click="goChildren" />
        <u-button type="success" text="课程预约" @click="goCourses" />
        <u-button text="预约记录" @click="goBookings" />
        <u-button text="签到记录" @click="goCheckins" />
        <u-button text="体测记录" @click="goFitness" />
        <u-button text="成长总览" @click="goGrowth" />
        <u-button text="站内消息" @click="goMessages" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { logout } from '@/api/modules/auth'
import { listParentBookings, listParentChildren, listParentCourses, listParentMessages } from '@/api/modules/parent'
import { getAuth, isLoggedIn } from '@/store/auth'
import { showError, showSuccess } from '@/utils/error'

const stats = reactive({
  children: 0,
  courses: 0,
  bookings: 0,
  unreadMessages: 0
})
const primaryChildId = ref<number | null>(null)

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

async function refreshSummary() {
  if (!ensureLogin()) return
  try {
    const [children, courses, bookings, messages] = await Promise.all([
      listParentChildren(),
      listParentCourses(),
      listParentBookings(),
      listParentMessages()
    ])
    stats.children = children.length
    stats.courses = courses.length
    stats.bookings = bookings.length
    stats.unreadMessages = messages.filter(item => !item.read).length
    primaryChildId.value = children[0]?.id ?? null
  } catch (error) {
    showError(error, '首页数据获取失败')
  }
}

function goChildren() {
  uni.navigateTo({ url: '/pages/parent/children/list' })
}

function goCourses() {
  uni.navigateTo({ url: '/pages/parent/courses/list' })
}

function goBookings() {
  uni.navigateTo({ url: '/pages/parent/bookings/list' })
}

function goCheckins() {
  uni.navigateTo({ url: '/pages/parent/checkin/list' })
}

function goFitness() {
  uni.navigateTo({ url: '/pages/parent/fitness/list' })
}

function goGrowth() {
  if (!primaryChildId.value) {
    uni.showToast({ title: '请先绑定孩子', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `/pages/parent/growth/index?studentId=${primaryChildId.value}` })
}

function goMessages() {
  uni.navigateTo({ url: '/pages/parent/messages/list' })
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
  if (ensureLogin()) {
    refreshSummary()
  }
})

onShow(() => {
  if (ensureLogin()) {
    refreshSummary()
  }
})
</script>

<style scoped lang="scss">
.stats-grid {
  margin-top: 18rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}

.stat-item {
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  background: #f8fafc;
  padding: 16rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #6b7280;
}

.stat-value {
  margin-top: 8rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #111827;
}

.actions-grid {
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}
</style>

