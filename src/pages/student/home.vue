<template>
  <view class="page">
    <view class="card">
      <view class="title">学生端首页</view>
      <view class="sub-title" style="margin-top: 8rpx">查看自己的课程、训练与体测数据</view>

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
  ensureLogin()
})
</script>

