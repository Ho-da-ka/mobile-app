<template>
  <view class="container">
    <!-- Header Section -->
    <view class="header row between">
      <view class="title-section">
        <text class="main-title">训练记录</text>
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
        <u-empty mode="list" text="暂无训练记录" icon="http://cdn.uviewui.com/uview/empty/list.png"></u-empty>
      </view>

      <view v-else>
        <view v-for="item in rows" :key="item.id" class="training-card">
          <view class="card-header row between">
            <view class="course-name">{{ item.courseName }}</view>
            <u-tag 
              v-if="item.intensityLevel"
              :text="item.intensityLevel" 
              size="mini" 
              :type="getIntensityType(item.intensityLevel)"
              shape="circle"
              plain
            ></u-tag>
          </view>
          
          <view class="info-row row">
            <view class="info-item">
              <u-icon name="calendar" color="#F97316" size="32rpx"></u-icon>
              <text class="info-text">{{ item.trainingDate || '-' }}</text>
            </view>
            <view class="info-item margin-left">
              <u-icon name="clock" color="#F97316" size="32rpx"></u-icon>
              <text class="info-text">{{ item.durationMinutes }} 分钟</text>
            </view>
          </view>

          <view class="section-box">
            <view class="section-title row">
              <u-icon name="edit-pen" color="#F97316" size="32rpx"></u-icon>
              <text>训练内容</text>
            </view>
            <view class="section-content">{{ item.trainingContent || '暂无内容' }}</view>
          </view>

          <view class="section-box">
            <view class="section-title row">
              <u-icon name="chat" color="#F97316" size="32rpx"></u-icon>
              <text>表现反馈</text>
            </view>
            <view class="section-content">{{ item.performanceSummary || '暂无反馈' }}</view>
          </view>

          <view v-if="item.coachComment" class="coach-comment">
            <view class="comment-header row">
              <u-icon name="account-fill" color="#F97316" size="32rpx"></u-icon>
              <text>教练评语</text>
            </view>
            <view class="comment-text">{{ item.coachComment }}</view>
          </view>
        </view>
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

function getIntensityType(level: string) {
  if (level.includes('高') || level.includes('High')) return 'error'
  if (level.includes('中') || level.includes('Medium')) return 'warning'
  return 'success'
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

.training-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  border-top: 8rpx solid #F97316;

  .card-header {
    margin-bottom: 24rpx;
    
    .course-name {
      font-size: 32rpx;
      font-weight: 700;
      color: #1E293B;
    }
  }

  .info-row {
    margin-bottom: 32rpx;
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .info-text {
        font-size: 26rpx;
        color: #64748B;
      }
    }
    
    .margin-left {
      margin-left: 40rpx;
    }
  }

  .section-box {
    margin-bottom: 24rpx;
    
    .section-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #334155;
      margin-bottom: 12rpx;
      gap: 8rpx;
    }
    
    .section-content {
      font-size: 26rpx;
      color: #64748B;
      line-height: 1.6;
      background: #F8FAFC;
      padding: 16rpx 24rpx;
      border-radius: 12rpx;
    }
  }

  .coach-comment {
    margin-top: 32rpx;
    padding-top: 24rpx;
    border-top: 2rpx dashed #E2E8F0;
    
    .comment-header {
      font-size: 28rpx;
      font-weight: 600;
      color: #F97316;
      margin-bottom: 12rpx;
      gap: 8rpx;
    }
    
    .comment-text {
      font-size: 26rpx;
      color: #475569;
      font-style: italic;
      line-height: 1.6;
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
