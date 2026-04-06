<template>
  <view class="page">
    <view class="card">
      <view class="title" style="font-size: 30rpx">体测记录</view>
      <view style="margin-top: 12rpx">选择学员</view>
      <picker :range="children" range-key="name" :value="childIndex" @change="onChildChange">
        <view class="picker">{{ selectedChildName }}</view>
      </picker>
      <view class="row gap" style="margin-top: 12rpx">
        <u-button size="small" type="primary" text="查询" @click="fetchFitness" />
      </view>
    </view>

    <view v-if="loading" class="card">加载中...</view>
    <view v-else-if="records.length === 0" class="card">暂无体测记录</view>
    <view v-else>
      <view v-for="record in records" :key="record.id" class="card">
        <view class="name">{{ record.itemName }}</view>
        <view class="sub-title" style="margin-top: 8rpx">学员：{{ record.studentName }}</view>
        <view class="sub-title">测试日期：{{ record.testDate }}</view>
        <view class="sub-title">成绩：{{ record.testValue }} {{ record.unit }}</view>
        <view class="sub-title" v-if="record.comment">备注：{{ record.comment }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { listParentChildren, listParentFitness, type ParentChild } from '@/api/modules/parent'
import type { FitnessTestRecord } from '@/types/parent'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const loading = ref(false)
const children = ref<ParentChild[]>([])
const childIndex = ref(0)
const records = ref<FitnessTestRecord[]>([])

const selectedChildId = computed(() => children.value[childIndex.value]?.id || 0)
const selectedChildName = computed(() => children.value[childIndex.value]?.name || '请先绑定学员')

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function onChildChange(event: any) {
  childIndex.value = Number(event.detail.value) || 0
}

async function fetchChildren() {
  const rows = await listParentChildren()
  children.value = rows
  if (childIndex.value >= children.value.length) {
    childIndex.value = 0
  }
}

async function fetchFitness() {
  if (!ensureLogin()) return
  loading.value = true
  try {
    records.value = await listParentFitness(selectedChildId.value || undefined)
  } catch (error) {
    showError(error, '体测记录获取失败')
  } finally {
    loading.value = false
  }
}

async function fetchData() {
  if (!ensureLogin()) return
  try {
    await fetchChildren()
    await fetchFitness()
  } catch (error) {
    showError(error, '页面数据初始化失败')
  }
}

onLoad(fetchData)
onShow(fetchData)
</script>

<style scoped lang="scss">
.name {
  font-size: 30rpx;
  font-weight: 700;
}

.picker {
  margin-top: 10rpx;
  background: #f9fafb;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
}
</style>

