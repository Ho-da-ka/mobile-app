<template>
  <view class="page">
    <view class="sticky-header">
      <view class="search-row">
        <view class="search-container">
          <up-search
            placeholder="搜索学员姓名"
            v-model="query.studentName"
            :show-action="false"
            @search="handleSearch"
            @clear="handleReset"
            shape="round"
            bg-color="#F1F5F9"
            height="72rpx"
          />
        </view>
        <view class="action-icons">
          <view class="icon-btn add-btn" @click="goCreate">
            <up-icon name="plus" size="40rpx" color="#FFFFFF" />
          </view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="list-scroll">
      <view v-if="loading && rows.length === 0" class="state-container">
        <up-loading-icon text="正在加载考勤..." size="32" color="#3B82F6" />
      </view>

      <view v-else-if="rows.length === 0" class="state-container">
        <up-empty mode="data" text="暂无考勤记录" />
      </view>

      <view v-else class="list-padding">
        <view v-for="item in rows" :key="item.id" class="list-card">
          <view class="card-header">
            <text class="card-title">{{ item.studentName }}</text>
            <up-tag :text="item.checkinStatus" :type="item.checkinStatus === 'CHECKED_IN' ? 'success' : 'info'" size="mini" shape="circle" />
          </view>
          
          <view class="card-meta">
            <view class="meta-item">
              <up-icon name="calendar" size="24rpx" color="#94A3B8" />
              <text class="meta-text">{{ item.courseName }}</text>
            </view>
            <view class="meta-item">
              <up-icon name="clock" size="24rpx" color="#94A3B8" />
              <text class="meta-text">签到时间：{{ formatDateTime(item.checkinTime) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { listAttendances, type AttendanceRecord } from '@/api/modules/attendances'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const query = reactive({ studentName: '' })
const loading = ref(false)
const rows = ref<AttendanceRecord[]>([])

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
    const data = await listAttendances({
      studentName: query.studentName.trim() || undefined
    })
    rows.value = data
  } catch (error) {
    showError(error, '考勤列表获取失败')
  } finally {
    loading.value = false
  }
}

onPullDownRefresh(async () => {
  await fetchData()
  uni.stopPullDownRefresh()
})

function handleSearch() {
  fetchData()
}

function handleReset() {
  query.studentName = ''
  fetchData()
}

function goCreate() {
  uni.navigateTo({ url: '/pages/admin/attendances/form' })
}

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
  display: flex;
  flex-direction: column;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  padding: 20rpx 32rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.search-container {
  flex: 1;
}

.action-icons {
  display: flex;
  align-items: center;
}

.icon-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  &.add-btn {
    background-color: #3B82F6;
  }
}

.list-scroll {
  flex: 1;
  height: 0;
}

.list-padding {
  padding: 24rpx 0 40rpx;
}

.state-container {
  padding: 100rpx 0;
  display: flex;
  justify-content: center;
}

.list-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin: 0 32rpx 24rpx;
  border: 1rpx solid #E2E8F0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;

  .card-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #0F172A;
  }
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .meta-text {
      font-size: 26rpx;
      color: #64748B;
    }
  }
}
</style>
