<template>
  <view class="page">
    <view class="card">
      <view class="title">教练信息</view>
      <view class="sub-title" style="margin-top: 10rpx">当前页基于课程数据自动汇总，后续接入独立教练接口后可无缝替换。</view>

      <view style="margin-top: 20rpx">
        <view>教练姓名筛选</view>
        <input class="input" v-model="keyword" placeholder="请输入教练姓名关键词" @confirm="buildCoachRows" />
      </view>

      <view class="row gap" style="margin-top: 18rpx">
        <u-button type="primary" text="查询" @click="buildCoachRows" />
        <u-button text="重置" @click="handleReset" />
      </view>
    </view>

    <view v-if="loading" class="card">加载中...</view>

    <view v-else>
      <view v-for="coach in rows" :key="coach.name" class="card">
        <view class="row between coach-header">
          <view>
            <view class="title-small">{{ coach.name }}</view>
            <view class="sub-title" style="margin-top: 8rpx">课程数量：{{ coach.courseCount }} 门</view>
          </view>
          <view class="coach-badge">{{ coach.statusSummary }}</view>
        </view>

        <view class="detail-line">
          <text class="label">课程类型</text>
          <text class="value">{{ coach.courseTypes || '-' }}</text>
        </view>
        <view class="detail-line">
          <text class="label">最近授课</text>
          <text class="value">{{ coach.latestCourseText }}</text>
        </view>
        <view class="detail-line">
          <text class="label">最近课程时间</text>
          <text class="value">{{ coach.latestCourseTime || '-' }}</text>
        </view>
      </view>

      <view v-if="!rows.length" class="card">暂无可展示的教练信息</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { listCourses, type Course } from '@/api/modules/courses'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

interface CoachRow {
  name: string
  courseCount: number
  courseTypes: string
  latestCourseText: string
  latestCourseTime: string
  statusSummary: string
}

const loading = ref(false)
const keyword = ref('')
const allCourses = ref<Course[]>([])
const rows = ref<CoachRow[]>([])

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function normalizeCoachName(value: string) {
  const text = (value || '').trim()
  return text || '未填写教练姓名'
}

function buildCoachRows() {
  const grouped = new Map<string, Course[]>()
  const keywordText = keyword.value.trim()

  allCourses.value.forEach((course) => {
    const coachName = normalizeCoachName(course.coachName)
    if (keywordText && !coachName.includes(keywordText)) {
      return
    }
    const current = grouped.get(coachName) || []
    current.push(course)
    grouped.set(coachName, current)
  })

  rows.value = Array.from(grouped.entries())
    .map(([name, courses]) => {
      const sorted = [...courses].sort((a, b) => (b.startTime || '').localeCompare(a.startTime || ''))
      const latest = sorted[0]
      const typeSet = Array.from(new Set(courses.map((item) => item.courseType).filter(Boolean)))
      const plannedCount = courses.filter((item) => item.status === 'PLANNED').length
      const ongoingCount = courses.filter((item) => item.status === 'ONGOING').length
      return {
        name,
        courseCount: courses.length,
        courseTypes: typeSet.join('、'),
        latestCourseText: latest ? `${latest.name}（${latest.courseCode}）` : '-',
        latestCourseTime: latest?.startTime || '-',
        statusSummary: `待开课 ${plannedCount} / 进行中 ${ongoingCount}`
      }
    })
    .sort((a, b) => b.courseCount - a.courseCount || a.name.localeCompare(b.name))
}

async function fetchData() {
  loading.value = true
  try {
    const page = await listCourses({ page: 0, size: 200 })
    allCourses.value = page.content
    buildCoachRows()
  } catch (error) {
    showError(error, '教练信息获取失败')
  } finally {
    loading.value = false
  }
}

function handleReset() {
  keyword.value = ''
  buildCoachRows()
}

onLoad(() => {
  if (ensureLogin()) {
    fetchData()
  }
})

onShow(() => {
  if (ensureLogin() && !loading.value) {
    buildCoachRows()
  }
})
</script>

<style scoped lang="scss">
.input {
  background: #f9fafb;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  margin-top: 10rpx;
}

.title-small {
  font-size: 30rpx;
  font-weight: 600;
}

.coach-header {
  align-items: flex-start;
}

.coach-badge {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: #ecfeff;
  color: #155e75;
  font-size: 22rpx;
}

.detail-line {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding-top: 14rpx;
}

.label {
  color: #64748b;
  flex-shrink: 0;
}

.value {
  text-align: right;
}
</style>
