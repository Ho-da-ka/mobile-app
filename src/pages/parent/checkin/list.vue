<template>
  <view class="page">
    <view v-if="loading && rows.length === 0" class="state-container">
      <up-loading-icon text="正在加载..." size="32" color="#2563EB" />
    </view>

    <view v-else-if="rows.length === 0" class="state-container">
      <up-empty mode="list" text="暂无签到记录" />
    </view>

    <view v-else class="list-padding">
      <view v-for="item in rows" :key="item.id" class="checkin-card">
        <view class="card-header">
          <text class="course-name">{{ item.courseName }}</text>
          <up-tag text="已到课" type="success" size="mini" shape="circle" />
        </view>
        
        <view class="card-body">
          <view class="meta-item">
            <text class="meta-label">签到学员：</text>
            <text class="meta-value">{{ item.studentName }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">签到时间：</text>
            <text class="meta-value">{{ formatDateTime(item.checkinTime) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { listMyCheckins } from '@/api/modules/student'
import type { AttendanceRecord } from '@/api/modules/attendances'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const loading = ref(false)
const rows = ref<AttendanceRecord[]>([])

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
    rows.value = await listMyCheckins()
  } catch (error) {
    showError(error, '签到记录加载失败')
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

.checkin-card {
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

    .meta-item {
      display: flex;
      align-items: center;

      .meta-label {
        font-size: 24rpx;
        color: #94A3B8;
        width: 140rpx;
      }

      .meta-value {
        font-size: 26rpx;
        color: #475569;
        font-weight: 600;
      }
    }
  }
}
</style>
