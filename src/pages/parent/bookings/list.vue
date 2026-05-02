<template>
  <view class="page">
    <view v-if="loading && rows.length === 0" class="state-container">
      <up-loading-icon text="加载中..." size="32" color="#2563EB" />
    </view>

    <view v-else-if="rows.length === 0" class="state-container">
      <up-empty mode="list" text="暂无预约记录" />
    </view>

    <view v-else class="list-padding">
      <view v-for="item in rows" :key="item.id" class="booking-card">
        <view class="card-header">
          <view class="course-name">{{ item.courseName }}</view>
          <up-tag :text="item.bookingStatus" :type="item.bookingStatus === 'BOOKED' ? 'success' : 'info'" size="mini" shape="circle" plain />
        </view>
        
        <view class="card-body">
          <view class="info-row">
            <text class="info-label">预约学员</text>
            <text class="info-value">{{ item.studentName }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">签到状态</text>
            <up-tag :text="item.checkinStatus" :type="item.checkinStatus === 'CHECKED_IN' ? 'success' : 'warning'" size="mini" plain />
          </view>
          <view class="info-row">
            <text class="info-label">预约时间</text>
            <text class="info-value">{{ formatDateTime(item.createdAt) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { listMyBookings, type ParentHomeBooking } from '@/api/modules/student'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const loading = ref(false)
const rows = ref<ParentHomeBooking[]>([])

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

async function loadData() {
  if (!ensureLogin()) return
  loading.value = true
  try {
    rows.value = await listMyBookings()
  } catch (error) {
    showError(error, '预约记录加载失败')
  } finally {
    loading.value = false
  }
}

onPullDownRefresh(async () => {
  await loadData()
  uni.stopPullDownRefresh()
})

onLoad(() => {
  loadData()
})

onShow(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.page {
  background-color: #F8FAFC;
  min-height: 100vh;
}

.list-padding {
  padding: 32rpx;
}

.state-container {
  padding-top: 200rpx;
  display: flex;
  justify-content: center;
}

.booking-card {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.02);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .course-name {
      font-size: 30rpx;
      font-weight: 700;
      color: #1E293B;
    }
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .info-label {
        font-size: 24rpx;
        color: #94A3B8;
      }

      .info-value {
        font-size: 26rpx;
        color: #475569;
        font-weight: 600;
      }
    }
  }
}
</style>
