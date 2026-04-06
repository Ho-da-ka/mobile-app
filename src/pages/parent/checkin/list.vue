<template>
  <view class="page">
    <view class="card row between">
      <view class="title" style="font-size: 30rpx">签到记录</view>
      <u-button size="small" type="primary" text="刷新" @click="fetchData" />
    </view>

    <view class="card" v-if="pendingBookings.length > 0">
      <view class="title" style="font-size: 28rpx">待签到预约</view>
      <view v-for="item in pendingBookings" :key="item.id" class="pending-item">
        <view>
          <view class="name">{{ item.courseName }}</view>
          <view class="sub-title">学员：{{ item.studentName }}</view>
        </view>
        <u-button size="mini" type="primary" text="签到" @click="handleQuickCheckin(item.id)" />
      </view>
    </view>

    <view v-if="loading" class="card">加载中...</view>
    <view v-else-if="checkins.length === 0" class="card">暂无签到记录</view>
    <view v-else>
      <view v-for="record in checkins" :key="record.id" class="card">
        <view class="name">{{ record.courseName }}</view>
        <view class="sub-title" style="margin-top: 8rpx">学员：{{ record.studentName }}</view>
        <view class="sub-title">签到日期：{{ record.attendanceDate }}</view>
        <view class="sub-title">状态：{{ statusText(record.status) }}</view>
        <view class="sub-title" v-if="record.note">备注：{{ record.note }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  createParentCheckin,
  listParentBookings,
  listParentCheckins,
  type ParentBooking
} from '@/api/modules/parent'
import type { AttendanceRecord } from '@/types/parent'
import { isLoggedIn } from '@/store/auth'
import { showError, showSuccess } from '@/utils/error'

const loading = ref(false)
const checkins = ref<AttendanceRecord[]>([])
const pendingBookings = ref<ParentBooking[]>([])

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function statusText(status: string) {
  return status === 'PRESENT' ? '到课' : status
}

async function fetchData() {
  if (!ensureLogin()) return
  loading.value = true
  try {
    const [checkinRows, bookingRows] = await Promise.all([listParentCheckins(), listParentBookings()])
    checkins.value = checkinRows
    pendingBookings.value = bookingRows.filter(item => item.bookingStatus === 'BOOKED' && item.checkinStatus !== 'CHECKED_IN')
  } catch (error) {
    showError(error, '签到数据获取失败')
  } finally {
    loading.value = false
  }
}

async function handleQuickCheckin(bookingId: number) {
  try {
    await createParentCheckin({ bookingId })
    showSuccess('签到成功')
    fetchData()
  } catch (error) {
    showError(error, '签到失败')
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

.pending-item {
  margin-top: 12rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 14rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

