<template>
  <view class="page">
    <view v-if="loading && rows.length === 0" class="state-container">
      <up-loading-icon text="正在加载课程..." size="32" color="#2563EB" />
    </view>

    <view v-else-if="rows.length === 0" class="state-container">
      <up-empty mode="list" text="暂无可预约课程" />
    </view>

    <view v-else class="list-padding">
      <view v-for="item in rows" :key="item.id" class="course-card">
        <view class="card-header">
          <text class="course-title">{{ item.name }}</text>
          <up-tag :text="item.courseType" type="primary" size="mini" shape="circle" plain />
        </view>
        
        <view class="card-body">
          <view class="info-row">
            <up-icon name="calendar" size="28rpx" color="#94A3B8" />
            <text class="info-text">{{ formatDateTime(item.startTime) }}</text>
          </view>
          <view class="info-row">
            <up-icon name="map" size="28rpx" color="#94A3B8" />
            <text class="info-text">{{ item.venue }}</text>
          </view>
          <view class="info-row">
            <up-icon name="account" size="28rpx" color="#94A3B8" />
            <text class="info-text">主讲教练：{{ item.coachName }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="slots-info">
            <text class="slots-label">剩余名额：</text>
            <text class="slots-value">{{ item.availableCount }}/{{ item.capacity }}</text>
          </view>
          <up-button 
            text="立即预约" 
            size="small" 
            type="primary" 
            shape="circle"
            :disabled="item.availableCount <= 0"
            @click="handleBook(item.id)"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { listParentCourses } from '@/api/modules/parent'
import type { ParentHomeCourse } from '@/api/modules/student'
import { isLoggedIn } from '@/store/auth'
import { showError, showSuccess } from '@/utils/error'

const loading = ref(false)
const rows = ref<ParentHomeCourse[]>([])

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

async function fetchData() {
  if (loading.value) return
  loading.value = true
  try {
    rows.value = await listParentCourses()
  } catch (error) {
    showError(error, '获取课程列表失败')
  } finally {
    loading.value = false
  }
}

async function handleBook(courseId: number) {
  // Booking logic implementation...
  uni.showModal({
    title: '确认预约',
    content: '确定要为您的孩子预约这门课程吗？',
    success: (res) => {
      if (res.confirm) {
        showSuccess('预约功能开发中')
      }
    }
  })
}

onPullDownRefresh(async () => {
  await fetchData()
  uni.stopPullDownRefresh()
})

onLoad(() => {
  if (ensureLogin()) fetchData()
})

onShow(() => {
  if (ensureLogin()) fetchData()
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

.course-card {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .course-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #1E293B;
    }
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-bottom: 32rpx;

    .info-row {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .info-text {
        font-size: 26rpx;
        color: #64748B;
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 24rpx;
    border-top: 1rpx solid #F1F5F9;

    .slots-info {
      .slots-label {
        font-size: 24rpx;
        color: #94A3B8;
      }
      .slots-value {
        font-size: 28rpx;
        font-weight: 700;
        color: #475569;
      }
    }
  }
}
</style>
