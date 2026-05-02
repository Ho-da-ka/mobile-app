<template>
  <view class="page">
    <view v-if="loading && rows.length === 0" class="state-container">
      <up-loading-icon text="加载中..." vertical color="#F97316"></up-loading-icon>
    </view>
    
    <view v-else-if="rows.length === 0" class="state-container">
      <up-empty mode="list" text="暂无课程记录" icon="http://cdn.uviewui.com/uview/empty/list.png"></up-empty>
    </view>
    
    <view v-else class="list-container">
      <view v-for="item in rows" :key="item.id" class="course-card">
        <view class="card-header">
          <view class="course-name">{{ item.name }}</view>
          <up-tag :text="item.status" size="mini" type="warning" plain shape="circle"></up-tag>
        </view>
        
        <view class="card-body">
          <view class="info-row">
            <up-icon name="calendar" size="28rpx" color="#94A3B8"></up-icon>
            <text class="info-text">{{ formatDateTime(item.startTime) }} ({{ item.durationMinutes }}分钟)</text>
          </view>
          <view class="info-row">
            <up-icon name="account" size="28rpx" color="#94A3B8"></up-icon>
            <text class="info-text">教练：{{ item.coachName }}</text>
          </view>
          <view class="info-row">
            <up-icon name="map" size="28rpx" color="#94A3B8"></up-icon>
            <text class="info-text">场地：{{ item.venue }}</text>
          </view>
        </view>

        <view class="card-footer" v-if="item.bookingStatus || item.checkinStatus">
          <up-tag v-if="item.bookingStatus" :text="'预约:' + item.bookingStatus" size="mini" type="info" plain></up-tag>
          <up-tag v-if="item.checkinStatus" :text="'签到:' + item.checkinStatus" size="mini" :type="item.checkinStatus === 'CHECKED_IN' ? 'success' : 'info'" plain style="margin-left: 12rpx"></up-tag>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { listStudentCourses, type StudentCourse } from '@/api/modules/student'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const loading = ref(false)
const rows = ref<StudentCourse[]>([])

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
    rows.value = await listStudentCourses()
  } catch (error) {
    showError(error, '课程数据加载失败')
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
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 32rpx;
}

.state-container {
  padding-top: 200rpx;
  display: flex;
  justify-content: center;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.course-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .course-name {
      font-size: 32rpx;
      font-weight: 700;
      color: #0f172a;
    }
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .info-row {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .info-text {
        font-size: 26rpx;
        color: #64748b;
      }
    }
  }

  .card-footer {
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f1f5f9;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
