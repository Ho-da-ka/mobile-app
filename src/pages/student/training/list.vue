<template>
  <view class="page">
    <view v-if="loading && rows.length === 0" class="state-container">
      <up-loading-icon text="加载中..." vertical color="#F97316"></up-loading-icon>
    </view>
    
    <view v-else-if="rows.length === 0" class="state-container">
      <up-empty mode="list" text="暂无训练记录" icon="http://cdn.uviewui.com/uview/empty/list.png"></up-empty>
    </view>
    
    <view v-else class="list-container">
      <view v-for="item in rows" :key="item.id" class="training-card">
        <view class="card-header">
          <view class="course-name">{{ item.courseName }}</view>
          <up-tag 
            v-if="item.intensityLevel" 
            :text="item.intensityLevel" 
            size="mini" 
            :type="getIntensityType(item.intensityLevel)" 
            plain 
            shape="circle"
          ></up-tag>
        </view>
        
        <view class="card-body">
          <view class="info-row">
            <up-icon name="calendar" size="28rpx" color="#94A3B8"></up-icon>
            <text class="info-text">{{ item.trainingDate || '-' }}</text>
          </view>
          <view class="info-row">
            <up-icon name="clock" size="28rpx" color="#94A3B8"></up-icon>
            <text class="info-text">{{ item.durationMinutes }} 分钟</text>
          </view>
          
          <view class="section-box">
            <view class="section-title">训练内容</view>
            <view class="section-content">{{ item.trainingContent || '暂无内容' }}</view>
          </view>

          <view class="section-box">
            <view class="section-title">表现反馈</view>
            <view class="section-content">{{ item.performanceSummary || '暂无反馈' }}</view>
          </view>
        </view>

        <view class="card-footer" v-if="item.coachComment">
          <view class="comment-section">
            <view class="comment-header">
              <up-icon name="chat" size="24rpx" color="#F97316"></up-icon>
              <text class="comment-label">教练评语</text>
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
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
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

.training-card {
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

    .section-box {
      margin-top: 16rpx;
      
      .section-title {
        font-size: 24rpx;
        font-weight: 600;
        color: #94a3b8;
        margin-bottom: 8rpx;
        text-transform: uppercase;
        letter-spacing: 1rpx;
      }
      
      .section-content {
        font-size: 26rpx;
        color: #334155;
        line-height: 1.6;
        background: #f8fafc;
        padding: 16rpx 24rpx;
        border-radius: 12rpx;
      }
    }
  }

  .card-footer {
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f1f5f9;

    .comment-section {
      .comment-header {
        display: flex;
        align-items: center;
        gap: 8rpx;
        margin-bottom: 8rpx;

        .comment-label {
          font-size: 24rpx;
          font-weight: 600;
          color: #f97316;
        }
      }
      
      .comment-text {
        font-size: 26rpx;
        color: #475569;
        font-style: italic;
        line-height: 1.6;
      }
    }
  }
}
</style>
