<template>
  <view class="page">
    <view class="card" v-if="loading">加载中...</view>

    <view class="card" v-else-if="record">
      <view class="title">{{ record.studentName }}</view>
      <view class="sub-title" style="margin-top: 10rpx">课程：{{ record.courseName }}</view>

      <view class="field"><text class="key">训练日期</text><text>{{ record.trainingDate || '-' }}</text></view>
      <view class="field"><text class="key">训练时长</text><text>{{ record.durationMinutes }} 分钟</text></view>
      <view class="field"><text class="key">强度等级</text><text>{{ intensityText(record.intensityLevel) }}</text></view>
      <view class="field block"><text class="key">训练内容</text><text class="value-block">{{ record.trainingContent || '-' }}</text></view>
      <view class="field block"><text class="key">训练反馈</text><text class="value-block">{{ record.performanceSummary || '-' }}</text></view>
      <view class="field block"><text class="key">教练评语</text><text class="value-block">{{ record.coachComment || '-' }}</text></view>
      <view class="field"><text class="key">创建时间</text><text>{{ record.createdAt || '-' }}</text></view>
      <view class="field"><text class="key">更新时间</text><text>{{ record.updatedAt || '-' }}</text></view>

      <view class="form-actions">
        <u-button text="返回" @click="goBack" />
        <u-button type="primary" text="编辑" @click="goEdit" />
      </view>
    </view>

    <view class="card" v-else>未找到训练记录</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getTrainingRecord } from '@/api/modules/training'
import { findLabel, trainingIntensityOptions } from '@/constants/enums'
import { isLoggedIn } from '@/store/auth'
import type { TrainingRecord } from '@/types/api'
import { showError } from '@/utils/error'

const loading = ref(false)
const record = ref<TrainingRecord | null>(null)
const recordId = ref(0)

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function intensityText(value: string) {
  return findLabel(trainingIntensityOptions, value)
}

async function fetchDetail() {
  if (!recordId.value) return
  loading.value = true
  try {
    record.value = await getTrainingRecord(recordId.value)
  } catch (error) {
    showError(error, '获取训练记录详情失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

function goEdit() {
  if (!recordId.value) return
  uni.navigateTo({ url: `/pages/admin/training/form?mode=edit&id=${recordId.value}` })
}

onLoad((query) => {
  if (!ensureLogin()) return
  recordId.value = Number(query?.id || 0)
  if (!recordId.value) {
    uni.showToast({ title: '缺少训练记录ID', icon: 'none' })
    return
  }
  fetchDetail()
})
</script>

<style scoped lang="scss">
.field {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}

.field.block {
  display: block;
}

.key {
  color: #6b7280;
}

.value-block {
  display: block;
  margin-top: 12rpx;
  color: #0f172a;
  line-height: 1.6;
}
</style>
