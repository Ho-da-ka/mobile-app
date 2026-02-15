<template>
  <view class="page">
    <view class="card">
      <view class="row between">
        <view>
          <view class="title">管理首页</view>
          <view class="sub-title" style="margin-top: 8rpx">{{ userSummary }}</view>
        </view>
        <u-button size="small" type="error" plain text="退出登录" @click="handleLogout" />
      </view>
    </view>

    <view class="card">
      <view class="row between">
        <view>
          <view style="font-weight: 600">后端服务状态</view>
          <view class="sub-title" style="margin-top: 8rpx">{{ pingText }}</view>
        </view>
        <u-button size="small" type="primary" plain text="刷新" @click="refreshPing" />
      </view>
    </view>

    <view class="card menu-card" @click="goStudents">
      <view class="title-small">学员管理</view>
      <view class="sub-title">查看、筛选、新增和编辑学员</view>
    </view>

    <view class="card menu-card" @click="goCourses">
      <view class="title-small">课程管理</view>
      <view class="sub-title">查看、筛选、新增和编辑课程</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { verifyPublicPing } from '@/api/modules/auth'
import { clearAuth, getAuth, isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const pingText = ref('未知')

const userSummary = computed(() => {
  const auth = getAuth()
  if (!auth) return '未登录'
  const roleLabel = auth.role === 'ADMIN' ? '管理员' : '教练'
  return `${auth.username}（${roleLabel}）`
})

async function refreshPing() {
  try {
    const data = await verifyPublicPing()
    pingText.value = `${data.status} · ${data.time}`
  } catch (error) {
    pingText.value = '不可用'
    showError(error, '服务状态获取失败')
  }
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

function handleLogout() {
  clearAuth()
  uni.reLaunch({ url: '/pages/login/index' })
}

onLoad(() => {
  if (ensureLogin()) {
    refreshPing()
  }
})

onShow(() => {
  ensureLogin()
})
</script>

<style scoped lang="scss">
.title-small {
  font-size: 30rpx;
  font-weight: 600;
}

.menu-card {
  cursor: pointer;
}
</style>
