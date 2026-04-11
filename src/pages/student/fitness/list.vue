<template>
  <view class="page">
    <view class="card row between">
      <view class="title">体测记录</view>
      <u-button size="mini" type="primary" plain text="刷新" :loading="loading" @click="loadData" />
    </view>

    <view v-if="loading" class="card">加载中...</view>
    <view v-else-if="rows.length === 0" class="card">暂无体测记录</view>
    <view v-else>
      <view v-for="item in rows" :key="item.id" class="card">
        <view style="font-size: 30rpx; font-weight: 600">{{ item.itemName }}</view>
        <view class="sub-title" style="margin-top: 8rpx">测试日期：{{ item.testDate || '-' }}</view>
        <view class="sub-title">结果：{{ item.testValue }} {{ item.unit }}</view>
        <view class="sub-title" style="margin-top: 8rpx">说明：{{ item.comment || '-' }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'
import { listStudentFitnessTests, type StudentFitnessRecord } from '@/api/modules/student'

const loading = ref(false)
const rows = ref<StudentFitnessRecord[]>([])

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

async function loadData() {
  if (!ensureLogin()) return
  loading.value = true
  try {
    rows.value = await listStudentFitnessTests()
  } catch (error) {
    showError(error, '体测记录加载失败')
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  loadData()
})

onShow(() => {
  loadData()
})
</script>
