<template>
  <view class="page">
    <view v-if="loading && rows.length === 0" class="state-container">
      <up-loading-icon text="加载中..." vertical color="#F97316"></up-loading-icon>
    </view>
    
    <view v-else-if="rows.length === 0" class="state-container">
      <up-empty mode="list" text="暂无体测记录" icon="http://cdn.uviewui.com/uview/empty/list.png"></up-empty>
    </view>
    
    <view v-else class="list-container">
      <view v-for="item in rows" :key="item.id" class="fitness-card">
        <view class="card-header">
          <view class="item-name">
            <up-icon :name="getFitnessIcon(item.itemName)" size="36rpx" color="#F97316"></up-icon>
            <text class="name-text">{{ item.itemName }}</text>
          </view>
          <view class="test-date">{{ item.testDate || '-' }}</view>
        </view>
        
        <view class="card-body">
          <view class="result-display">
            <text class="value">{{ item.testValue }}</text>
            <text class="unit">{{ item.unit }}</text>
          </view>

          <view class="comment-box" v-if="item.comment">
            <view class="box-title">体测说明</view>
            <view class="box-text">{{ item.comment }}</view>
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
  if (name.includes('跑') || name.includes('Run')) return 'car'
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

.fitness-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .item-name {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .name-text {
        font-size: 32rpx;
        font-weight: 700;
        color: #0f172a;
      }
    }

    .test-date {
      font-size: 24rpx;
      color: #94a3b8;
    }
  }

  .card-body {
    .result-display {
      display: flex;
      align-items: baseline;
      justify-content: center;
      margin-bottom: 32rpx;
      
      .value {
        font-size: 72rpx;
        font-weight: 800;
        color: #f97316;
        font-family: 'DIN Alternate', sans-serif;
      }
      
      .unit {
        font-size: 28rpx;
        color: #64748b;
        margin-left: 12rpx;
        font-weight: 600;
      }
    }

    .comment-box {
      background: #f8fafc;
      padding: 20rpx 24rpx;
      border-radius: 16rpx;
      
      .box-title {
        font-size: 20rpx;
        font-weight: 600;
        color: #94a3b8;
        margin-bottom: 8rpx;
        text-transform: uppercase;
        letter-spacing: 2rpx;
      }
      
      .box-text {
        font-size: 26rpx;
        color: #475569;
        line-height: 1.5;
      }
    }
  }
}
</style>
