<template>
  <view class="page">
    <view class="card row between">
      <view class="title" style="font-size: 30rpx">我的孩子</view>
      <u-button size="small" type="primary" text="刷新" @click="fetchChildren" />
    </view>

    <view v-if="loading" class="card">加载中...</view>
    <view v-else-if="children.length === 0" class="card">当前账号还未绑定学员</view>

    <view v-else>
      <view v-for="child in children" :key="child.id" class="card">
        <view class="row between">
          <view>
            <view class="name">{{ child.name }}</view>
            <view class="sub-title" style="margin-top: 6rpx">学号：{{ child.studentNo }}</view>
            <view class="sub-title">性别：{{ genderText(child.gender) }} / 状态：{{ statusText(child.status) }}</view>
            <view class="sub-title">监护人：{{ child.guardianName || '-' }} / {{ child.guardianPhone || '-' }}</view>
          </view>
          <view class="age-tag">{{ ageText(child.birthDate) }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { listParentChildren, type ParentChild } from '@/api/modules/parent'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const loading = ref(false)
const children = ref<ParentChild[]>([])

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function genderText(gender: string) {
  return gender === 'MALE' ? '男' : gender === 'FEMALE' ? '女' : '-'
}

function statusText(status: string) {
  return status === 'ACTIVE' ? '在训' : status === 'INACTIVE' ? '停训' : '-'
}

function ageText(birthDate?: string) {
  if (!birthDate) return '--岁'
  const year = Number(String(birthDate).slice(0, 4))
  if (!year) return '--岁'
  return `${Math.max(0, new Date().getFullYear() - year)}岁`
}

async function fetchChildren() {
  if (!ensureLogin()) return
  loading.value = true
  try {
    children.value = await listParentChildren()
  } catch (error) {
    showError(error, '学员列表获取失败')
  } finally {
    loading.value = false
  }
}

onLoad(fetchChildren)
onShow(fetchChildren)
</script>

<style scoped lang="scss">
.name {
  font-size: 30rpx;
  font-weight: 700;
}

.age-tag {
  padding: 10rpx 14rpx;
  border-radius: 999rpx;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 24rpx;
}
</style>

