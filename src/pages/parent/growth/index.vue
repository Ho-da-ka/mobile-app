<template>
  <view class="page">
    <view class="header-section">
      <view class="title">成长总览</view>
      <view class="subtitle">追踪孩子的每一个进步时刻</view>

      <scroll-view scroll-x class="child-scroll" v-if="children.length > 0">
        <view class="child-row">
          <view
            v-for="child in children"
            :key="child.id"
            class="child-chip"
            :class="{ active: child.id === currentStudentId }"
            @click="selectChild(child.id)"
          >
            {{ child.name }}
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="loading && !overview" class="state-container">
      <up-loading-icon text="数据同步中..." size="32" color="#2563EB" />
    </view>
    
    <view v-else-if="!overview" class="state-container">
      <up-empty mode="data" text="暂无成长数据" />
    </view>

    <view v-else class="content-container">
      <!-- Profile Card -->
      <view class="overview-card">
        <view class="card-header">
          <view class="student-name">{{ overview.studentName }}</view>
          <view class="goal-tag">{{ overview.goalFocus || '全面提升' }}</view>
        </view>
        <view class="tag-row">
          <up-tag v-for="(tag, idx) in (overview.trainingTags || '').split(',').filter(t => t)" :key="idx" :text="tag" size="mini" type="info" plain shape="circle" class="tag-item" />
        </view>
        <view class="period-info">目标周期：{{ goalPeriodText }}</view>
      </view>

      <!-- Latest Evaluation -->
      <view class="section-title" v-if="overview.latestEvaluation">最新阶段评估</view>
      <view class="evaluation-card" v-if="overview.latestEvaluation">
        <view class="eval-header">
          <text class="cycle-name">{{ overview.latestEvaluation.cycleName }}</text>
          <view class="rate-box">
            <text class="rate-label">出勤率</text>
            <text class="rate-value">{{ formatRate(overview.latestEvaluation.attendanceRate) }}</text>
          </view>
        </view>
        <view class="eval-body">
          <view class="eval-item">
            <text class="eval-label">体测变化：</text>
            <text class="eval-text">{{ displayText(overview.latestEvaluation.fitnessSummary) }}</text>
          </view>
          <view class="eval-item">
            <text class="eval-label">教练评价：</text>
            <text class="eval-text">{{ displayText(overview.latestEvaluation.coachEvaluation) }}</text>
          </view>
          <view class="report-box" v-if="overview.latestEvaluation.parentReport">
            <text class="report-text">{{ overview.latestEvaluation.parentReport }}</text>
          </view>
        </view>
      </view>

      <!-- Recent Feedback -->
      <view class="section-title">最近训练反馈</view>
      <view v-if="overview.recentTrainingFeedback.length === 0" class="empty-inline">
        暂无反馈记录
      </view>
      <view
        v-for="item in overview.recentTrainingFeedback"
        :key="item.id"
        class="feedback-card"
      >
        <view class="feedback-header">
          <text class="date">{{ item.trainingDate }}</text>
          <text class="course">{{ item.trainingContent }}</text>
        </view>
        <view class="feedback-grid">
          <view class="grid-item">
            <text class="item-label">表现亮点</text>
            <text class="item-value">{{ displayText(item.highlightNote) }}</text>
          </view>
          <view class="grid-item">
            <text class="item-label">提升点</text>
            <text class="item-value">{{ displayText(item.improvementNote) }}</text>
          </view>
        </view>
        <view class="ai-summary" v-if="item.aiSummary">
          <up-icon name="chat-fill" size="24rpx" color="#3B82F6" />
          <text class="ai-text">{{ item.aiSummary }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import {
  getParentGrowthOverview,
  listParentChildren,
  type ParentChild
} from '@/api/modules/parent'
import type { ParentGrowthOverview } from '@/types/parent'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const loading = ref(false)
const children = ref<ParentChild[]>([])
const overview = ref<ParentGrowthOverview | null>(null)
const currentStudentId = ref<number>(0)

const goalPeriodText = computed(() => {
  if (!overview.value) return '-'
  const { goalStartDate, goalEndDate } = overview.value
  if (!goalStartDate && !goalEndDate) return '-'
  return `${goalStartDate || '-'} ~ ${goalEndDate || '-'}`
})

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function displayText(value?: string | null) {
  return value && value.trim() ? value : '无记录'
}

function formatRate(rate?: number) {
  if (rate == null) return '0%'
  return `${(Number(rate) * 100).toFixed(0)}%`
}

async function loadGrowth(studentId?: number) {
  if (!ensureLogin()) return
  loading.value = true
  try {
    const childList = await listParentChildren()
    children.value = childList
    const resolvedId = Number(studentId || currentStudentId.value || childList[0]?.id || 0)
    if (!resolvedId) {
      overview.value = null
      return
    }
    currentStudentId.value = resolvedId
    overview.value = await getParentGrowthOverview(resolvedId)
  } catch (error) {
    showError(error, '成长数据获取失败')
  } finally {
    loading.value = false
  }
}

onPullDownRefresh(async () => {
  await loadGrowth()
  uni.stopPullDownRefresh()
})

function selectChild(studentId: number) {
  if (studentId === currentStudentId.value) return
  loadGrowth(studentId)
}

onLoad((options) => {
  const studentId = Number(options?.studentId || 0)
  loadGrowth(studentId)
})

onShow(() => {
  if (currentStudentId.value) {
    loadGrowth(currentStudentId.value)
  }
})
</script>

<style scoped lang="scss">
.page {
  background-color: #F8FAFC;
  min-height: 100vh;
  padding-bottom: 60rpx;
}

.header-section {
  background-color: #FFFFFF;
  padding: 40rpx 32rpx;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);

  .title {
    font-size: 44rpx;
    font-weight: 800;
    color: #1E293B;
  }

  .subtitle {
    font-size: 26rpx;
    color: #94A3B8;
    margin-top: 10rpx;
  }
}

.child-scroll {
  margin-top: 32rpx;
  white-space: nowrap;
}

.child-row {
  display: inline-flex;
  gap: 16rpx;
}

.child-chip {
  padding: 12rpx 32rpx;
  background-color: #F1F5F9;
  color: #64748B;
  border-radius: 99rpx;
  font-size: 26rpx;
  font-weight: 600;
  transition: all 0.2s;

  &.active {
    background-color: #2563EB;
    color: #FFFFFF;
    box-shadow: 0 8rpx 15rpx rgba(37, 99, 235, 0.2);
  }
}

.state-container {
  padding-top: 160rpx;
  display: flex;
  justify-content: center;
}

.content-container {
  padding: 32rpx;
}

.overview-card {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  border-radius: 32rpx;
  padding: 40rpx;
  color: #FFFFFF;
  margin-bottom: 40rpx;
  box-shadow: 0 12rpx 30rpx rgba(37, 99, 235, 0.15);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .student-name {
      font-size: 40rpx;
      font-weight: 800;
    }

    .goal-tag {
      background-color: rgba(255, 255, 255, 0.2);
      padding: 8rpx 24rpx;
      border-radius: 99rpx;
      font-size: 22rpx;
      font-weight: 600;
    }
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 24rpx;
    
    .tag-item {
      background-color: rgba(255, 255, 255, 0.1) !important;
      border: none !important;
      color: #FFFFFF !important;
    }
  }

  .period-info {
    font-size: 24rpx;
    opacity: 0.8;
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1E293B;
  margin: 40rpx 0 24rpx 8rpx;
}

.evaluation-card {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);

  .eval-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #F1F5F9;

    .cycle-name {
      font-size: 30rpx;
      font-weight: 700;
      color: #1E293B;
    }

    .rate-box {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .rate-label {
        font-size: 20rpx;
        color: #94A3B8;
      }
      .rate-value {
        font-size: 32rpx;
        font-weight: 800;
        color: #10B981;
      }
    }
  }

  .eval-body {
    display: flex;
    flex-direction: column;
    gap: 20rpx;

    .eval-item {
      .eval-label {
        font-size: 24rpx;
        color: #94A3B8;
        font-weight: 600;
      }
      .eval-text {
        font-size: 26rpx;
        color: #475569;
      }
    }

    .report-box {
      margin-top: 10rpx;
      padding: 24rpx;
      background-color: #F8FAFC;
      border-radius: 20rpx;
      border-left: 8rpx solid #E2E8F0;

      .report-text {
        font-size: 26rpx;
        color: #334155;
        line-height: 1.6;
      }
    }
  }
}

.feedback-card {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.02);

  .feedback-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24rpx;

    .date {
      font-size: 24rpx;
      font-weight: 700;
      color: #3B82F6;
    }
    .course {
      font-size: 24rpx;
      color: #94A3B8;
    }
  }

  .feedback-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20rpx;
    margin-bottom: 24rpx;

    .grid-item {
      .item-label {
        font-size: 22rpx;
        color: #94A3B8;
        display: block;
        margin-bottom: 8rpx;
      }
      .item-value {
        font-size: 26rpx;
        color: #1E293B;
        font-weight: 600;
      }
    }
  }

  .ai-summary {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding-top: 20rpx;
    border-top: 1rpx dashed #F1F5F9;

    .ai-text {
      font-size: 24rpx;
      color: #3B82F6;
      font-style: italic;
    }
  }
}

.empty-inline {
  padding: 40rpx;
  text-align: center;
  color: #CBD5E1;
  font-size: 24rpx;
}
</style>
