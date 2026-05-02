<template>
  <view class="page">
    <view v-if="loading && rows.length === 0" class="state-container">
      <up-loading-icon text="同步消息中..." size="32" color="#2563EB" />
    </view>

    <view v-else-if="rows.length === 0" class="state-container">
      <up-empty mode="message" text="您的收件箱是空的" />
    </view>

    <view v-else class="list-padding">
      <view v-for="item in rows" :key="item.id" class="message-card" :class="{ unread: !item.read }">
        <view class="card-header">
          <view class="type-indicator">
            <up-icon :name="item.msgType === 'REMINDER' ? 'bell-fill' : 'volume-fill'" size="40rpx" :color="item.read ? '#94A3B8' : '#2563EB'" />
          </view>
          <view class="title-area">
            <text class="msg-title">{{ item.title }}</text>
            <text class="msg-time">{{ formatTime(item.createdAt) }}</text>
          </view>
          <view v-if="!item.read" class="unread-dot" />
        </view>
        
        <view class="card-body">
          <text class="msg-content">{{ item.content }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { listParentMessages } from '@/api/modules/parent'
import type { ParentMessage as ParentHomeMessage } from '@/api/modules/parent'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const loading = ref(false)
const rows = ref<ParentHomeMessage[]>([])

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function formatTime(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  return isToday ? value.split('T')[1].slice(0, 5) : value.slice(5, 10).replace('-', '/')
}

async function loadData() {
  if (!ensureLogin()) return
  loading.value = true
  try {
    rows.value = await listParentMessages()
  } catch (error) {
    showError(error, '获取消息失败')
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

.message-card {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.02);
  border-left: 8rpx solid transparent;
  transition: all 0.2s;

  &.unread {
    border-left-color: #2563EB;
    background-color: #F0F7FF;
  }

  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    position: relative;

    .type-indicator {
      width: 80rpx;
      height: 80rpx;
      border-radius: 20rpx;
      background-color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
    }

    .title-area {
      flex: 1;
      display: flex;
      flex-direction: column;

      .msg-title {
        font-size: 28rpx;
        font-weight: 700;
        color: #1E293B;
      }

      .msg-time {
        font-size: 22rpx;
        color: #94A3B8;
      }
    }

    .unread-dot {
      width: 16rpx;
      height: 16rpx;
      background-color: #EF4444;
      border-radius: 8rpx;
    }
  }

  .card-body {
    .msg-content {
      font-size: 26rpx;
      color: #64748B;
      line-height: 1.6;
    }
  }
}
</style>
