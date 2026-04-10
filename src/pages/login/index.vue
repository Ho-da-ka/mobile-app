<template>
  <view class="page">
    <view class="card">
      <view class="title">统一登录</view>
      <view class="sub-title" style="margin-top: 8rpx">ZF 青少年体能培训教务管理平台</view>

      <view style="margin-top: 28rpx">
        <view class="required">用户名</view>
        <input class="input" v-model="form.username" placeholder="请输入用户名" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">密码</view>
        <input class="input" v-model="form.password" password placeholder="请输入密码" />
      </view>

      <view class="form-actions">
        <u-button type="primary" :loading="loading" text="登录并进入系统" @click="handleLogin" />
      </view>

      <view class="tip">认证方式：JWT（Bearer Token）。登录状态本地保存 7 天，超时后需重新登录。</view>
      <view class="tip">默认账号：admin/Admin@123，coach/Coach@123，student/Student@123，parent/Parent@123</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { loginWithJwt, verifyPublicPing } from '@/api/modules/auth'
import type { RoleCode } from '@/types/api'
import { showError, showSuccess } from '@/utils/error'

const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

const roleHomeMap: Record<RoleCode, string> = {
  ADMIN: '/pages/admin/home',
  COACH: '/pages/admin/home',
  STUDENT: '/pages/student/home',
  PARENT: '/pages/parent/home'
}

function routeByRole(role: RoleCode) {
  uni.reLaunch({ url: roleHomeMap[role] || '/pages/admin/home' })
}

async function handleLogin() {
  if (!form.username.trim() || !form.password.trim()) {
    uni.showToast({ title: '请填写用户名和密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await verifyPublicPing()
    const authData = await loginWithJwt(form.username.trim(), form.password)
    showSuccess('登录成功')
    setTimeout(() => {
      routeByRole(authData.role)
    }, 300)
  } catch (error) {
    showError(error, '登录失败，请检查账号、密码或后端服务')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.input {
  background: #f9fafb;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  margin-top: 10rpx;
}

.tip {
  margin-top: 20rpx;
  color: #6b7280;
  font-size: 24rpx;
}
</style>

