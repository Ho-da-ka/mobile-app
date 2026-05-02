<template>
  <view class="login-container">
    <view class="login-header">
      <view class="logo-box">
        <u-icon name="account-fill" color="#2563eb" size="80rpx"></u-icon>
      </view>
      <view class="app-name">ZF 青少年体能培训</view>
      <view class="app-slogan">教务管理平台 · 移动端</view>
    </view>

    <view class="login-form">
      <view class="form-title">统一登录</view>
      
      <view class="input-group">
        <text class="label">用户名</text>
        <u-input
          v-model="form.username"
          placeholder="账号 / 手机号"
          border="bottom"
          clearable
          fontSize="32rpx"
          :customStyle="{ padding: '20rpx 0' }"
        ></u-input>
      </view>

      <view class="input-group">
        <text class="label">密码</text>
        <u-input
          v-model="form.password"
          placeholder="请输入密码"
          :password="!showPassword"
          border="bottom"
          fontSize="32rpx"
          :customStyle="{ padding: '20rpx 0' }"
          :suffixIcon="showPassword ? 'eye-fill' : 'eye-off-fill'"
          suffixIconStyle="color: #94a3b8; font-size: 44rpx;"
          @suffixClick="togglePassword"
        >
        </u-input>
      </view>

      <!-- 登录按钮 -->
      <view 
        class="submit-btn" 
        :class="{ 'btn-disabled': loading }" 
        @click="handleLogin"
      >
        <text v-if="!loading">登录并进入系统</text>
        <text v-else>正在登录...</text>
      </view>

      <view class="login-tips">
        <view class="tip-item">
          <u-icon name="info-circle" color="#94a3b8" size="28rpx"></u-icon>
          <text class="tip-text">家长初次登录密码为手机号后 6 位</text>
        </view>
      </view>
    </view>

    <view class="login-footer">
      <view class="tech-info">
        <text>Security Protocol: JWT Bearer Token</text>
        <text>Session Validity: 7 Days</text>
      </view>
      <view class="copyright">© 2026 ZF Youth Fitness Management</view>
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

const buttonStyle = {
  width: '100%',
  height: '100rpx',
  background: 'linear-gradient(to right, #2563eb, #3b82f6)',
  color: '#ffffff',
  fontSize: '32rpx',
  fontWeight: 'bold',
  borderRadius: '50rpx',
  border: 'none',
  marginTop: '40rpx',
  boxShadow: '0 10rpx 20rpx rgba(37, 99, 235, 0.2)'
}

const roleHomeMap: Record<RoleCode, string> = {
  ADMIN: '/pages/admin/home',
  COACH: '/pages/admin/home',
  STUDENT: '/pages/student/home',
  PARENT: '/pages/parent/home'
}

function routeByRole(role: RoleCode) {
  uni.reLaunch({ url: roleHomeMap[role] || '/pages/admin/home' })
}

function togglePassword() {
  showPassword.value = !showPassword.value
}

async function handleLogin() {
  const u = String(form.username || '').trim()
  const p = String(form.password || '')

  if (!u || !p) {
    uni.showToast({ title: '请输入账号密码', icon: 'none' })
    return
  }

  if (loading.value) return
  loading.value = true
  
  try {
    // 尝试先简单的 Ping 一下后端
    await verifyPublicPing()
    const authData = await loginWithJwt(u, p)
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

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  background: #ffffff;
  padding: 0 60rpx;
  display: flex;
  flex-direction: column;
}

.login-header {
  padding-top: 140rpx;
  padding-bottom: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .logo-box {
    width: 150rpx;
    height: 150rpx;
    background: #eff6ff;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30rpx;
  }

  .app-name {
    font-size: 44rpx;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: 2rpx;
  }

  .app-slogan {
    font-size: 26rpx;
    color: #94a3b8;
    margin-top: 12rpx;
  }
}

.login-form {
  flex: 1;

  .form-title {
    font-size: 38rpx;
    font-weight: 600;
    color: #334155;
    margin-bottom: 60rpx;
    position: relative;
    padding-left: 24rpx;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8rpx;
      height: 36rpx;
      background: #2563eb;
      border-radius: 4rpx;
    }
  }

  .input-group {
    margin-bottom: 40rpx;

    .label {
      font-size: 28rpx;
      font-weight: 600;
      color: #475569;
      margin-bottom: 8rpx;
      display: block;
    }
  }
}

.eye-icon {
  padding: 10rpx;
}

.submit-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(to right, #2563eb, #3b82f6);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40rpx;
  box-shadow: 0 10rpx 20rpx rgba(37, 99, 235, 0.2);

  &:active {
    opacity: 0.8;
  }

  &.btn-disabled {
    background: #cbd5e1;
    box-shadow: none;
  }
}

.login-tips {

  margin-top: 40rpx;
  
  .tip-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
  }
  
  .tip-text {
    font-size: 24rpx;
    color: #94a3b8;
  }
}

.login-footer {
  padding-bottom: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .tech-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
    
    text {
      font-size: 22rpx;
      color: #cbd5e1;
    }
  }

  .copyright {
    margin-top: 24rpx;
    font-size: 20rpx;
    color: #e2e8f0;
  }
}
</style>
