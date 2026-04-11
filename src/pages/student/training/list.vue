<template>
  <view class="page">
    <view class="card row between">
      <view class="title">训练记录</view>
      <u-button size="mini" type="primary" plain text="刷新" :loading="loading" @click="loadData" />
    </view>

    <view v-if="loading" class="card">加载中...</view>
    <view v-else-if="rows.length === 0" class="card">暂无训练记录</view>
    <view v-else>
      <view v-for="item in rows" :key="item.id" class="card">
        <view style="font-size: 30rpx; font-weight: 600">{{ item.courseName }}</view>
        <view class="sub-title" style="margin-top: 8rpx">训练日期：{{ item.trainingDate || '-' }}</view>
        <view class="sub-title">训练时长：{{ item.durationMinutes }} 分钟</view>
        <view class="sub-title">训练强度：{{ item.intensityLevel || '-' }}</view>
        <view class="sub-title" style="margin-top: 8rpx">训练内容：{{ item.trainingContent || '-' }}</view>
        <view class="sub-title" style="margin-top: 8rpx">表现反馈：{{ item.performanceSummary || '-' }}</view>
        <view class="sub-title" style="margin-top: 8rpx">教练评语：{{ item.coachComment || '-' }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'
import { listStudentTrainingRecords, type StudentTrainingRecord } from '@/api/modules/student'

const loading = ref(false)
const rows = ref<StudentTrainingRecord[]>([])

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
    rows.value = await listStudentTrainingRecords()
  } catch (error) {
    showError(error, '训练记录加载失败')
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
