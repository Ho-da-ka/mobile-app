<template>
  <view class="page">
    <view class="card row between">
      <view class="title" style="font-size: 30rpx">预约记录</view>
      <u-button size="small" type="primary" text="刷新" @click="fetchBookings" />
    </view>

    <view v-if="loading" class="card">加载中...</view>
    <view v-else-if="bookings.length === 0" class="card">暂无预约记录</view>

    <view v-else>
      <view v-for="item in bookings" :key="item.id" class="card">
        <view class="row between">
          <view>
            <view class="name">{{ item.courseName }}</view>
            <view class="sub-title" style="margin-top: 8rpx">学员：{{ item.studentName }}</view>
            <view class="sub-title">
              预约状态：{{ bookingStatusText(item.bookingStatus) }} / 签到状态：{{ checkinStatusText(item.checkinStatus) }}
            </view>
            <view class="sub-title">预约时间：{{ formatDateTime(item.createdAt) }}</view>
            <view class="sub-title" v-if="item.bookingRemark">备注：{{ item.bookingRemark }}</view>
          </view>
          <view class="status-tag" :class="item.bookingStatus === 'BOOKED' ? 'ok' : 'disabled'">
            {{ bookingStatusText(item.bookingStatus) }}
          </view>
        </view>

        <view class="row gap" style="margin-top: 14rpx">
          <u-button
            size="small"
            type="warning"
            text="取消预约"
            :disabled="item.bookingStatus !== 'BOOKED'"
            @click="handleCancel(item.id)"
          />
          <u-button
            size="small"
            type="primary"
            text="立即签到"
            :disabled="item.bookingStatus !== 'BOOKED' || item.checkinStatus === 'CHECKED_IN'"
            @click="handleCheckin(item.id)"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  cancelParentBooking,
  createParentCheckin,
  listParentBookings,
  type ParentBooking
} from '@/api/modules/parent'
import { isLoggedIn } from '@/store/auth'
import { showError, showSuccess } from '@/utils/error'

const loading = ref(false)
const bookings = ref<ParentBooking[]>([])

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  return value.replace('T', ' ')
}

function bookingStatusText(status: string) {
  return status === 'BOOKED' ? '已预约' : status === 'CANCELED' ? '已取消' : status
}

function checkinStatusText(status: string) {
  return status === 'CHECKED_IN' ? '已签到' : status === 'PENDING' ? '待签到' : status
}

async function fetchBookings() {
  if (!ensureLogin()) return
  loading.value = true
  try {
    bookings.value = await listParentBookings()
  } catch (error) {
    showError(error, '预约记录获取失败')
  } finally {
    loading.value = false
  }
}

function handleCancel(id: number) {
  uni.showModal({
    title: '取消预约',
    content: '确认取消这条预约记录吗？',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await cancelParentBooking(id)
        showSuccess('预约已取消')
        fetchBookings()
      } catch (error) {
        showError(error, '取消预约失败')
      }
    }
  })
}

async function handleCheckin(bookingId: number) {
  try {
    await createParentCheckin({ bookingId })
    showSuccess('签到成功')
    fetchBookings()
  } catch (error) {
    showError(error, '签到失败')
  }
}

onLoad(fetchBookings)
onShow(fetchBookings)
</script>

<style scoped lang="scss">
.name {
  font-size: 30rpx;
  font-weight: 700;
}

.status-tag {
  font-size: 24rpx;
  border-radius: 999rpx;
  padding: 8rpx 14rpx;
}

.ok {
  background: #dcfce7;
  color: #15803d;
}

.disabled {
  background: #f3f4f6;
  color: #6b7280;
}
</style>

