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
        <up-loading-icon text="正在加载训练..." size="32" color="#3B82F6" />
      </view>

      <view v-else-if="rows.length === 0" class="state-container">
        <up-empty mode="data" text="暂无训练记录" />
      </view>

      <view v-else class="list-padding">
        <view v-for="item in rows" :key="item.id" class="list-card" @click="goDetail(item.id)">
          <view class="card-header">
            <text class="card-title">{{ item.studentName }}</text>
            <up-tag :text="item.intensityLevel" :type="getIntensityType(item.intensityLevel)" size="mini" shape="circle" />
          </view>
          
          <view class="card-body">
            <view class="course-name">{{ item.courseName }}</view>
            <view class="meta-info">
              <view class="meta-item">
                <up-icon name="calendar" size="24rpx" color="#94A3B8" />
                <text class="meta-text">日期：{{ item.trainingDate }}</text>
              </view>
              <view class="meta-item">
                <up-icon name="clock" size="24rpx" color="#94A3B8" />
                <text class="meta-text">时长：{{ item.durationMinutes }}分钟</text>
              </view>
            </view>
            <view v-if="item.performanceSummary" class="feedback-box">
              <text class="feedback-label">表现：</text>
              <text class="feedback-text">{{ item.performanceSummary }}</text>
            </view>
          </view>

          <view class="card-footer">
            <view class="spacer" />
            <view class="actions">
              <text class="action-link primary" @click.stop="goEdit(item.id)">编辑</text>
              <text class="action-link" @click.stop="goDetail(item.id)">详情</text>
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
import { listTrainingRecords, type TrainingRecord } from '@/api/modules/training'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const query = reactive({ studentName: '' })
const loading = ref(false)
const rows = ref<TrainingRecord[]>([])

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function getIntensityType(level?: string) {
  if (level?.includes('高')) return 'error'
  if (level?.includes('中')) return 'warning'
  return 'primary'
}

async function fetchData() {
  if (loading.value) return
  loading.value = true
  try {
    const data = await listTrainingRecords({
      studentName: query.studentName.trim() || undefined
    })
    rows.value = data
  } catch (error) {
    showError(error, '训练列表获取失败')
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
  uni.navigateTo({ url: '/pages/admin/training/form?mode=create' })
}

function goEdit(id: number) {
  uni.navigateTo({ url: `/pages/admin/training/form?mode=edit&id=${id}` })
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/admin/training/detail?id=${id}` })
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
  margin-bottom: 24rpx;

  .card-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #0F172A;
  }
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  .course-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #374151;
  }

  .meta-info {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 10rpx;

      .meta-text {
        font-size: 24rpx;
        color: #6B7280;
      }
    }
  }

  .feedback-box {
    margin-top: 10rpx;
    background-color: #F9FAFB;
    padding: 16rpx 20rpx;
    border-radius: 12rpx;

    .feedback-label {
      font-size: 24rpx;
      font-weight: 600;
      color: #4B5563;
    }

    .feedback-text {
      font-size: 24rpx;
      color: #6B7280;
    }
  }
}

.card-footer {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #F1F5F9;
  display: flex;
  align-items: center;

  .spacer {
    flex: 1;
  }

  .actions {
    display: flex;
    gap: 32rpx;
  }

  .action-link {
    font-size: 26rpx;
    font-weight: 600;
    color: #64748B;

    &.primary {
      color: #3B82F6;
    }
  }
}
</style>
