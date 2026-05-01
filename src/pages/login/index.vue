<template>
  <view class="login-container">
    <view class="login-header">
      <view class="logo-box">
        <text class="logo-text">ZF</text>
      </view>
      <view class="app-title">青少年体能教务平台</view>
      <view class="app-subtitle">移动管理 · 专业科学</view>
    </view>

    <view class="login-form">
      <view class="form-title">用户登录</view>
      
      <!-- Username Input -->
      <view class="input-group">
        <view class="label">用户名 / 手机号</view>
        <view class="input-box">
          <input
            v-model="form.username"
            class="input-element"
            placeholder="请输入账号"
            placeholder-style="color: #cbd5e1"
            type="text"
          />
        </view>
      </view>

      <!-- Password Input -->
      <view class="input-group">
        <view class="label">登录密码</view>
        <view class="input-box">
          <input
            v-model="form.password"
            class="input-element"
            :password="!showPassword"
            placeholder="请输入密码"
            placeholder-style="color: #cbd5e1"
          />
          <view class="eye-btn" @click="showPassword = !showPassword">
            <text class="eye-text">{{ showPassword ? '隐藏' : '显示' }}</text>
          </view>
        </view>
      </view>

      <!-- Login Button -->
      <view class="login-btn-active" @click="handleLogin">
        <text v-if="!loading">确认登录</text>
        <text v-else>登录中...</text>
      </view>

      <view class="tips">
        <text>初始密码通常为手机号后 6 位</text>
      </view>
    </view>

    <view class="login-footer">
      <text class="copyright">© 2026 ZF Fitness Management</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { loginWithJwt, verifyPublicPing } from '@/api/modules/auth'
import type { RoleCode } from '@/types/api'
import { showError, showSuccess } from '@/utils/error'

const loading = ref(false)
const showPassword = ref(false)
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
  if (loading.value) return
  if (!form.username.trim() || !form.password.trim()) {
    uni.showToast({ title: '请填写完整', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await verifyPublicPing()
    const authData = await loginWithJwt(form.username.trim(), form.password)
    showSuccess('登录成功')
    setTimeout(() => {
      routeByRole(authData.role)
    }, 500)
  } catch (error) {
    showError(error, '登录失败，请检查账号密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background-color: #ffffff;
  padding: 0 60rpx;
}

.login-header {
  padding: 120rpx 0 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-box {
  width: 120rpx;
  height: 120rpx;
  background-color: #2563EB;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.logo-text {
  color: #ffffff;
  font-size: 50rpx;
  font-weight: bold;
}

.app-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #1e293b;
}

.app-subtitle {
  font-size: 24rpx;
  color: #94a3b8;
  margin-top: 10rpx;
}

.login-form {
  margin-top: 40rpx;
}

.form-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #334155;
  margin-bottom: 60rpx;
  padding-left: 20rpx;
  border-left: 10rpx solid #2563EB;
}

.input-group {
  margin-bottom: 40rpx;
}

.label {
  font-size: 26rpx;
  color: #64748b;
  margin-bottom: 16rpx;
}

.input-box {
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 20rpx;
  padding: 0 30rpx;
  height: 100rpx;
}

.input-element {
  flex: 1;
  height: 100rpx;
  font-size: 32rpx;
  color: #1e293b;
}

.eye-btn {
  padding-left: 20rpx;
}

.eye-text {
  font-size: 24rpx;
  color: #2563EB;
}

.login-btn-active {
  margin-top: 80rpx;
  height: 100rpx;
  background-color: #2563EB;
  color: #ffffff;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 10rpx 20rpx rgba(37, 99, 235, 0.2);
}

.tips {
  margin-top: 40rpx;
  text-align: center;
  font-size: 24rpx;
  color: #94a3b8;
}

.login-footer {
  position: fixed;
  bottom: 60rpx;
  width: 100%;
  left: 0;
  text-align: center;
}

.copyright {
  font-size: 20rpx;
  color: #cbd5e1;
}
</style>
