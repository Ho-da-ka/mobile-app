<template>
  <view class="page">
    <view class="card">
      <view class="title">管理端登录</view>
      <view class="sub-title" style="margin-top: 8rpx">ZF青少年体能培训教务管理平台</view>

      <view style="margin-top: 28rpx">
        <view class="required">用户名</view>
        <input class="input" v-model="form.username" placeholder="请输入用户名" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">密码</view>
        <input class="input" v-model="form.password" type="password" placeholder="请输入密码" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">角色</view>
        <picker :range="roleOptions" range-key="label" :value="roleIndex" @change="onRoleChange">
          <view class="picker">{{ selectedRoleLabel }}</view>
        </picker>
      </view>

      <view class="form-actions">
        <u-button type="primary" :loading="loading" text="登录并进入系统" @click="handleLogin" />
      </view>

      <view class="tip">当前阶段鉴权方式：HTTP Basic（阶段2将扩展JWT）</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { loginWithBasic, verifyPublicPing } from '@/api/modules/auth'
import type { RoleCode } from '@/types/api'
import { isLoggedIn } from '@/store/auth'
import { showError, showSuccess } from '@/utils/error'

const roleOptions = [
  { label: '管理员', value: 'ADMIN' as RoleCode },
  { label: '教练', value: 'COACH' as RoleCode }
]

const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
  role: 'ADMIN' as RoleCode
})

const roleIndex = computed(() => roleOptions.findIndex(item => item.value === form.role))
const selectedRoleLabel = computed(() => roleOptions.find(item => item.value === form.role)?.label || '-')

function onRoleChange(event: any) {
  const index = Number(event.detail.value)
  form.role = roleOptions[index]?.value || 'ADMIN'
}

async function handleLogin() {
  if (!form.username.trim() || !form.password.trim()) {
    uni.showToast({ title: '请填写用户名和密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await verifyPublicPing()
    await loginWithBasic(form.username.trim(), form.password, form.role)
    showSuccess('登录成功')
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/admin/home' })
    }, 300)
  } catch (error) {
    showError(error, '登录失败，请检查账号或后端服务')
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  if (isLoggedIn()) {
    uni.reLaunch({ url: '/pages/admin/home' })
  }
})
</script>

<style scoped lang="scss">
.input,
.picker {
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
