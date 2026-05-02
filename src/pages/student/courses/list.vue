<template>
  <view class="container">
    <!-- Header Section -->
    <view class="header row between">
      <view class="title-section">
        <text class="main-title">我的课程</text>
        <view class="title-bar"></view>
      </view>
      <u-button 
        size="mini" 
        type="primary" 
        plain 
        shape="circle"
        icon="reload"
        :loading="loading" 
        @click="loadData"
        :customStyle="{ borderColor: '#F97316', color: '#F97316' }"
      >刷新</u-button>
    </view>

    <!-- Content Section -->
    <view class="content">
      <view v-if="loading" class="empty-state">
        <u-loading-icon color="#F97316"></u-loading-icon>
        <text class="empty-text">加载中...</text>
      </view>
      
      <view v-else-if="rows.length === 0" class="empty-state">
        <u-empty mode="list" text="暂无课程记录" icon="http://cdn.uviewui.com/uview/empty/list.png"></u-empty>
      </view>

      <view v-else>
        <view v-for="item in rows" :key="item.id" class="course-card">
          <view class="card-header row between">
            <view class="course-name">{{ item.name }}</view>
            <u-tag 
              :text="item.status" 
              size="mini" 
              :type="getStatusType(item.status)"
              shape="circle"
              plain
            ></u-tag>
          </view>
          
          <view class="info-grid">
            <view class="info-item">
              <u-icon name="calendar" color="#F97316" size="32rpx"></u-icon>
              <text class="info-text">{{ formatDateTime(item.startTime) }}</text>
            </view>
            <view class="info-item">
              <u-icon name="clock" color="#F97316" size="32rpx"></u-icon>
              <text class="info-text">{{ item.durationMinutes }} 分钟</text>
            </view>
            <view class="info-item">
              <u-icon name="account" color="#F97316" size="32rpx"></u-icon>
              <text class="info-text">{{ item.coachName }} 教练</text>
            </view>
            <view class="info-item">
              <u-icon name="map" color="#F97316" size="32rpx"></u-icon>
              <text class="info-text">{{ item.venue }}</text>
            </view>
          </view>

          <view class="card-footer row gap">
            <u-tag v-if="item.bookingStatus" :text="'预约: ' + item.bookingStatus" size="mini" type="info" plain></u-tag>
            <u-tag v-if="item.checkinStatus" :text="'签到: ' + item.checkinStatus" size="mini" type="success" plain></u-tag>
          </view>
          
          <view v-if="item.description" class="description-box">
            <u-icon name="info-circle" color="#64748B" size="28rpx"></u-icon>
            <text class="description-text">{{ item.description }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
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

function getStatusType(status: string) {
  if (status.includes('已完成') || status.includes('Finished')) return 'success'
  if (status.includes('取消') || status.includes('Canceled')) return 'error'
  if (status.includes('进行') || status.includes('Progress')) return 'warning'
  return 'primary'
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

onLoad(() => {
  loadData()
})

onShow(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  background-color: #F8FAFC;
  padding: 32rpx;
}

.header {
  margin-bottom: 40rpx;
  
  .title-section {
    display: flex;
    flex-direction: column;
    
    .main-title {
      font-size: 40rpx;
      font-weight: 800;
      color: #1E293B;
    }
    
    .title-bar {
      width: 48rpx;
      height: 8rpx;
      background: #F97316;
      border-radius: 4rpx;
      margin-top: 8rpx;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  
  .empty-text {
    margin-top: 20rpx;
    color: #94A3B8;
    font-size: 28rpx;
  }
}

.course-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  border-left: 8rpx solid #F97316;

  .card-header {
    margin-bottom: 24rpx;
    
    .course-name {
      font-size: 32rpx;
      font-weight: 700;
      color: #1E293B;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20rpx;
    margin-bottom: 24rpx;

    .info-item {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .info-text {
        font-size: 26rpx;
        color: #64748B;
      }
    }
  }

  .card-footer {
    padding-top: 24rpx;
    border-top: 1rpx solid #F1F5F9;
  }
  
  .description-box {
    margin-top: 20rpx;
    padding: 16rpx;
    background: #F8FAFC;
    border-radius: 12rpx;
    display: flex;
    gap: 12rpx;
    
    .description-text {
      font-size: 24rpx;
      color: #64748B;
      line-height: 1.5;
    }
  }
}

.row {
  display: flex;
  align-items: center;
}

.between {
  justify-content: space-between;
}

.gap {
  gap: 16rpx;
}
</style>
