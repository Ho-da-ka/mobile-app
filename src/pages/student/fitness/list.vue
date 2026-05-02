<template>
  <view class="container">
    <!-- Header Section -->
    <view class="header row between">
      <view class="title-section">
        <text class="main-title">体测记录</text>
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
        <u-empty mode="list" text="暂无体测记录" icon="http://cdn.uviewui.com/uview/empty/list.png"></u-empty>
      </view>

      <view v-else>
        <view v-for="item in rows" :key="item.id" class="fitness-card">
          <view class="card-header row between">
            <view class="item-name row">
              <u-icon :name="getFitnessIcon(item.itemName)" color="#F97316" size="40rpx"></u-icon>
              <text class="margin-left-sm">{{ item.itemName }}</text>
            </view>
            <view class="test-date">{{ item.testDate || '-' }}</view>
          </view>
          
          <view class="result-section row center">
            <view class="result-value">{{ item.testValue }}</view>
            <view class="result-unit">{{ item.unit }}</view>
          </view>

          <view v-if="item.comment" class="comment-box">
            <view class="comment-label">说明</view>
            <view class="comment-text">{{ item.comment }}</view>
          </view>
          
          <view class="card-bg-icon">
            <u-icon :name="getFitnessIcon(item.itemName)" color="#F1F5F9" size="120rpx"></u-icon>
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
import { listStudentFitnessTests, type StudentFitnessRecord } from '@/api/modules/student'

const loading = ref(false)
const rows = ref<StudentFitnessRecord[]>([])

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function getFitnessIcon(name: string) {
  if (name.includes('跑') || name.includes('Run')) return 'car' // uview-plus might not have many sports icons, using generic ones
  if (name.includes('跳') || name.includes('Jump')) return 'level'
  if (name.includes('力量') || name.includes('Power')) return 'integral'
  if (name.includes('柔韧') || name.includes('Flex')) return 'heart'
  return 'star'
}

async function loadData() {
  if (!ensureLogin()) return
  loading.value = true
  try {
    rows.value = await listStudentFitnessTests()
  } catch (error) {
    showError(error, '体测记录加载失败')
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

.fitness-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;

  .card-header {
    margin-bottom: 40rpx;
    position: relative;
    z-index: 1;
    
    .item-name {
      font-size: 32rpx;
      font-weight: 700;
      color: #1E293B;
      gap: 12rpx;
    }
    
    .test-date {
      font-size: 24rpx;
      color: #94A3B8;
    }
  }

  .result-section {
    margin-bottom: 40rpx;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: baseline;
    justify-content: center;
    
    .result-value {
      font-size: 72rpx;
      font-weight: 800;
      color: #F97316;
      font-family: 'DIN Alternate', sans-serif;
    }
    
    .result-unit {
      font-size: 28rpx;
      color: #64748B;
      margin-left: 12rpx;
      font-weight: 600;
    }
  }

  .comment-box {
    background: #F8FAFC;
    padding: 20rpx 24rpx;
    border-radius: 16rpx;
    position: relative;
    z-index: 1;
    
    .comment-label {
      font-size: 22rpx;
      color: #94A3B8;
      margin-bottom: 8rpx;
      text-transform: uppercase;
      letter-spacing: 2rpx;
    }
    
    .comment-text {
      font-size: 26rpx;
      color: #475569;
      line-height: 1.5;
    }
  }
  
  .card-bg-icon {
    position: absolute;
    right: -20rpx;
    bottom: -20rpx;
    opacity: 0.5;
    z-index: 0;
  }
}

.row {
  display: flex;
  align-items: center;
}

.between {
  justify-content: space-between;
}

.center {
  justify-content: center;
}

.margin-left-sm {
  margin-left: 8rpx;
}
</style>
