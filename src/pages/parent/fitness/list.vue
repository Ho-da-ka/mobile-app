<template>
  <view class="page">
    <view v-if="loading && rows.length === 0" class="state-container">
      <up-loading-icon text="数据加载中..." size="32" color="#2563EB" />
    </view>

    <view v-else-if="rows.length === 0" class="state-container">
      <up-empty mode="list" text="暂无体测数据" />
    </view>

    <view v-else class="list-padding">
      <view v-for="item in rows" :key="item.id" class="fitness-card">
        <view class="card-header">
          <text class="item-name">{{ item.itemName }}</text>
          <text class="test-date">{{ item.testDate }}</text>
        </view>
        
        <view class="card-body">
          <view class="result-display">
            <text class="result-value">{{ item.testValue }}</text>
            <text class="result-unit">{{ item.unit }}</text>
          </view>
          <view class="student-info">测试学员：{{ item.studentName }}</view>
          <view v-if="item.comment" class="comment-box">
            <text class="comment-text">“ {{ item.comment }} ”</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { listParentFitness } from '@/api/modules/parent'
import type { FitnessTestRecord as FitnessRecord } from '@/types/parent'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const loading = ref(false)
const rows = ref<FitnessRecord[]>([])

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

async function loadData() {
  if (!ensureLogin()) return
  loading.value = true
  try {
    rows.value = await listParentFitness()
  } catch (error) {
    showError(error, '获取体测记录失败')
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

.fitness-card {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .item-name {
      font-size: 32rpx;
      font-weight: 700;
      color: #1E293B;
    }

    .test-date {
      font-size: 24rpx;
      color: #94A3B8;
    }
  }

  .card-body {
    .result-display {
      display: flex;
      align-items: baseline;
      gap: 8rpx;
      margin-bottom: 16rpx;

      .result-value {
        font-size: 56rpx;
        font-weight: 800;
        color: #2563EB;
      }

      .result-unit {
        font-size: 24rpx;
        color: #64748B;
      }
    }

    .student-info {
      font-size: 24rpx;
      color: #94A3B8;
      margin-bottom: 24rpx;
    }

    .comment-box {
      background-color: #F1F5F9;
      padding: 20rpx 24rpx;
      border-radius: 16rpx;
      
      .comment-text {
        font-size: 26rpx;
        color: #475569;
        font-style: italic;
      }
    }
  }
}
</style>
