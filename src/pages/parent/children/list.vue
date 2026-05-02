<template>
  <view class="page">
    <view v-if="loading && rows.length === 0" class="state-container">
      <up-loading-icon text="正在加载我的孩子..." size="32" color="#2563EB" />
    </view>

    <view v-else-if="rows.length === 0" class="state-container">
      <up-empty mode="list" text="您还没有绑定孩子" />
    </view>

    <view v-else class="list-padding">
      <view v-for="item in rows" :key="item.id" class="list-card">
        <view class="card-header">
          <view class="avatar-box">
            <up-icon name="account-fill" size="60rpx" color="#2563EB" />
          </view>
          <view class="info-main">
            <text class="child-name">{{ item.name }}</text>
            <text class="child-no">学号：{{ item.studentNo }}</text>
          </view>
          <up-tag :text="item.status" :type="item.status === 'ACTIVE' ? 'success' : 'info'" size="mini" shape="circle" />
        </view>
        
        <view class="card-body">
          <view class="meta-row">
            <text class="meta-label">性别</text>
            <text class="meta-value">{{ item.gender === 'MALE' ? '男' : '女' }}</text>
          </view>
          <view class="meta-row">
            <text class="meta-label">出生日期</text>
            <text class="meta-value">{{ item.birthDate }}</text>
          </view>
          <view class="meta-row">
            <text class="meta-label">监护人</text>
            <text class="meta-value">{{ item.guardianName }} ({{ item.guardianPhone }})</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { listMyChildren, type ParentHomeChild } from '@/api/modules/student'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const loading = ref(false)
const rows = ref<ParentHomeChild[]>([])

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

async function fetchData() {
  if (loading.value) return
  loading.value = true
  try {
    rows.value = await listMyChildren()
  } catch (error) {
    showError(error, '获取孩子列表失败')
  } finally {
    loading.value = false
  }
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

.list-card {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;

  .avatar-box {
    width: 100rpx;
    height: 100rpx;
    background-color: #EFF6FF;
    border-radius: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
  }

  .info-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;

    .child-name {
      font-size: 34rpx;
      font-weight: 700;
      color: #1E293B;
    }

    .child-no {
      font-size: 24rpx;
      color: #64748B;
    }
  }
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #F1F5F9;

  .meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .meta-label {
      font-size: 26rpx;
      color: #94A3B8;
    }

    .meta-value {
      font-size: 26rpx;
      font-weight: 600;
      color: #475569;
    }
  }
}
</style>
