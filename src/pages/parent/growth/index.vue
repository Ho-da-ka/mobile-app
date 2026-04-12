<template>
  <view class="page">
    <view class="card">
      <view class="title">成长总览</view>
      <view class="sub-title" style="margin-top: 8rpx">围绕训练目标查看最近训练反馈和阶段评估</view>

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

    <view v-if="loading" class="card">加载中...</view>
    <view v-else-if="!overview" class="card">暂无成长数据</view>
    <view v-else>
      <view class="card">
        <view class="row between">
          <view class="title" style="font-size: 32rpx">{{ overview.studentName }}</view>
          <view class="goal-badge">{{ overview.goalFocus || '未设置阶段目标' }}</view>
        </view>
        <view class="sub-title" style="margin-top: 12rpx">训练标签：{{ displayText(overview.trainingTags) }}</view>
        <view class="sub-title">风险提示：{{ displayText(overview.riskNotes) }}</view>
        <view class="sub-title">目标周期：{{ goalPeriodText }}</view>
      </view>

      <view class="card" v-if="overview.latestEvaluation">
        <view class="title" style="font-size: 30rpx">最新阶段评估</view>
        <view class="sub-title" style="margin-top: 12rpx">周期：{{ overview.latestEvaluation.cycleName }}</view>
        <view class="sub-title">出勤率：{{ formatRate(overview.latestEvaluation.attendanceRate) }}</view>
        <view class="sub-title">体测变化：{{ displayText(overview.latestEvaluation.fitnessSummary) }}</view>
        <view class="sub-title">教练评价：{{ displayText(overview.latestEvaluation.coachEvaluation) }}</view>
        <view class="sub-title">下阶段计划：{{ displayText(overview.latestEvaluation.nextStagePlan) }}</view>
        <view class="content" v-if="overview.latestEvaluation.parentReport">
          {{ overview.latestEvaluation.parentReport }}
        </view>
      </view>

      <view class="card">
        <view class="title" style="font-size: 30rpx">最近训练反馈</view>
        <view v-if="overview.recentTrainingFeedback.length === 0" class="sub-title" style="margin-top: 12rpx">
          暂无训练反馈
        </view>
        <view
          v-for="item in overview.recentTrainingFeedback"
          :key="item.id"
          class="feedback-item"
        >
          <view class="name">{{ item.trainingDate }} {{ item.trainingContent }}</view>
          <view class="sub-title">课堂亮点：{{ displayText(item.highlightNote) }}</view>
          <view class="sub-title">待改进点：{{ displayText(item.improvementNote) }}</view>
          <view class="sub-title">家长配合：{{ displayText(item.parentAction) }}</view>
          <view class="sub-title">下次建议：{{ displayText(item.nextStepSuggestion) }}</view>
          <view class="content" v-if="item.aiSummary">{{ item.aiSummary }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
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
  return value && value.trim() ? value : '无'
}

function formatRate(rate?: number) {
  if (rate == null) return '-'
  return `${(Number(rate) * 100).toFixed(1)}%`
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
.child-scroll {
  margin-top: 20rpx;
  white-space: nowrap;
}

.child-row {
  display: inline-flex;
  gap: 12rpx;
}

.child-chip {
  border-radius: 999rpx;
  padding: 10rpx 24rpx;
  background: #eef2ff;
  color: #4338ca;
  font-size: 24rpx;
}

.child-chip.active {
  background: #0f766e;
  color: #ffffff;
}

.goal-badge {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: #ecfeff;
  color: #0f766e;
  font-size: 24rpx;
  font-weight: 600;
}

.feedback-item + .feedback-item {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #e5e7eb;
}

.name {
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}

.content {
  margin-top: 12rpx;
  font-size: 27rpx;
  color: #1f2937;
  line-height: 1.6;
}
</style>
