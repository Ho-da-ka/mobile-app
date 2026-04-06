<template>
  <view class="page">
    <view class="card">
      <view class="title">家长端首页</view>
      <view class="sub-title" style="margin-top: 8rpx">管理孩子、预约课程、查看签到与消息。</view>

      <view class="form-actions">
        <u-button type="primary" text="我的孩子" @click="goChildren" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button type="success" text="可约课程" @click="goCourses" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button text="预约记录" @click="goBookings" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button text="签到记录" @click="goCheckins" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button text="体测结果" @click="goFitness" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button text="站内消息" @click="goMessages" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button type="error" plain text="退出登录" @click="handleLogout" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { logout } from '@/api/modules/auth'
import { getAuth, isLoggedIn } from '@/store/auth'
import { showError, showSuccess } from '@/utils/error'

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
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
  ensureLogin()
})
</script>
