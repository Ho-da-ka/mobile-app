<template>
  <view class="page">
    <!-- Sticky Search Header (Filters for Training Records) -->
    <view class="sticky-header">
      <view class="filter-grid">
        <view class="filter-item">
          <picker :range="studentOptions" range-key="name" :value="studentIndex" @change="onStudentChange">
            <view class="filter-picker">
              <text class="filter-label">学员:</text>
              <text class="filter-value u-line-1">{{ studentLabel }}</text>
              <u-icon name="arrow-down" size="24rpx" color="#64748B" />
            </view>
          </picker>
        </view>
        <view class="filter-item">
          <picker :range="courseOptions" range-key="name" :value="courseIndex" @change="onCourseChange">
            <view class="filter-picker">
              <text class="filter-label">课程:</text>
              <text class="filter-value u-line-1">{{ courseLabel }}</text>
              <u-icon name="arrow-down" size="24rpx" color="#64748B" />
            </view>
          </picker>
        </view>
      </view>

      <view class="search-row" style="margin-top: 20rpx">
        <view class="date-range">
          <picker mode="date" :value="query.startDate" @change="onStartDateChange">
            <view class="date-picker">
              <text class="date-text">{{ query.startDate || '开始' }}</text>
            </view>
          </picker>
          <text class="date-sep">-</text>
          <picker mode="date" :value="query.endDate" @change="onEndDateChange">
            <view class="date-picker">
              <text class="date-text">{{ query.endDate || '结束' }}</text>
            </view>
          </picker>
        </view>
        <view class="action-icons">
          <view class="icon-btn" @click="handleReset">
            <u-icon name="reload" size="36rpx" color="#64748B" />
          </view>
          <view class="icon-btn add-btn" @click="goCreate">
            <u-icon name="plus" size="36rpx" color="#FFFFFF" />
          </view>
        </view>
      </view>
    </view>

    <!-- List Content -->
    <scroll-view scroll-y class="list-scroll">
      <view v-if="loading && rows.length === 0" class="state-container">
        <u-loading-icon text="正在加载记录..." size="32" />
      </view>

      <view v-else-if="rows.length === 0" class="state-container">
        <u-empty mode="data" text="暂无训练记录" />
      </view>

      <view v-else class="list-padding">
        <view v-for="item in rows" :key="item.id" class="list-card" @click="goDetail(item.id)">
          <view class="card-header">
            <text class="card-title">{{ item.studentName }}</text>
            <u-tag :text="intensityText(item.intensityLevel)" :type="intensityTagType(item.intensityLevel)" size="mini" shape="circle" />
          </view>
          
          <view class="card-meta">
            <view class="meta-item">
              <u-icon name="grid" size="24rpx" color="#94A3B8" />
              <text class="meta-text">课程：{{ item.courseName }}</text>
            </view>
            <view class="meta-item">
              <u-icon name="calendar" size="24rpx" color="#94A3B8" />
              <text class="meta-text">日期：{{ item.trainingDate }} ({{ item.durationMinutes }}分钟)</text>
            </view>
            <view class="meta-item">
              <u-icon name="file-text" size="24rpx" color="#94A3B8" />
              <text class="meta-text u-line-2">内容：{{ item.trainingContent }}</text>
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
import { computed, reactive, ref, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { listTrainingRecords } from '@/api/modules/training'
import { listCourses, type Course } from '@/api/modules/courses'
import { listStudents, type Student } from '@/api/modules/students'
import { isLoggedIn } from '@/store/auth'
import { clearDraft, loadDraft, saveDraft } from '@/utils/draft'
import { showError } from '@/utils/error'
import { findLabel, trainingIntensityOptions } from '@/constants/enums'
import type { TrainingRecord } from '@/types/api'

const QUERY_DRAFT_KEY = 'training.query'
const defaults = {
  studentId: undefined as number | undefined,
  courseId: undefined as number | undefined,
  startDate: '',
  endDate: ''
}

const query = reactive({
  ...defaults,
  ...loadDraft(QUERY_DRAFT_KEY, defaults)
})

const loading = ref(false)
const rows = ref<TrainingRecord[]>([])
const studentOptions = ref<Array<Student & { name: string }>>([{ id: 0, name: '全部学员' } as Student & { name: string }])
const courseOptions = ref<Array<Course & { name: string }>>([{ id: 0, name: '全部课程' } as Course & { name: string }])

const studentIndex = computed(() => studentOptions.value.findIndex(item => item.id === (query.studentId || 0)))
const courseIndex = computed(() => courseOptions.value.findIndex(item => item.id === (query.courseId || 0)))
const studentLabel = computed(() => studentOptions.value[studentIndex.value]?.name || '全部学员')
const courseLabel = computed(() => courseOptions.value[courseIndex.value]?.name || '全部课程')

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function intensityText(value: string) {
  return findLabel(trainingIntensityOptions, value)
}

function intensityTagType(level: string) {
  switch (level) {
    case 'HIGH': return 'error'
    case 'MEDIUM': return 'warning'
    case 'LOW': return 'success'
    default: return 'info'
  }
}

async function loadOptions() {
  const [students, courses] = await Promise.all([
    listStudents({ page: 0, size: 200 }),
    listCourses({ page: 0, size: 200 })
  ])
  studentOptions.value = [{ id: 0, name: '全部学员' } as Student & { name: string }, ...students.content]
  courseOptions.value = [{ id: 0, name: '全部课程' } as Course & { name: string }, ...courses.content]
}

async function fetchData() {
  if (loading.value) return
  loading.value = true
  try {
    const data = await listTrainingRecords({
      studentId: query.studentId || undefined,
      courseId: query.courseId || undefined,
      startDate: query.startDate || undefined,
      endDate: query.endDate || undefined
    })
    rows.value = data || []
  } catch (error) {
    showError(error, '训练记录获取失败')
  } finally {
    loading.value = false
  }
}

function onStudentChange(event: any) {
  const index = Number(event.detail.value)
  query.studentId = studentOptions.value[index]?.id || undefined
  fetchData()
}

function onCourseChange(event: any) {
  const index = Number(event.detail.value)
  query.courseId = courseOptions.value[index]?.id || undefined
  fetchData()
}

function onStartDateChange(event: any) {
  query.startDate = event.detail.value
  fetchData()
}

function onEndDateChange(event: any) {
  query.endDate = event.detail.value
  fetchData()
}

function handleReset() {
  Object.assign(query, defaults)
  clearDraft(QUERY_DRAFT_KEY)
  fetchData()
}

function goCreate() {
  uni.navigateTo({ url: '/pages/admin/training/form?mode=create' })
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/admin/training/detail?id=${id}` })
}

function goEdit(id: number) {
  uni.navigateTo({ url: `/pages/admin/training/form?mode=edit&id=${id}` })
}

watch(
  () => ({ ...query }),
  (value) => saveDraft(QUERY_DRAFT_KEY, value),
  { deep: true }
)

onLoad(async () => {
  if (!ensureLogin()) return
  await loadOptions()
  await fetchData()
})

onShow(() => {
  if (ensureLogin()) {
    fetchData()
  }
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
  z-index: 100;
  background-color: #FFFFFF;
  padding: 24rpx 32rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
}

.filter-grid {
  display: flex;
  gap: 16rpx;
}

.filter-item {
  flex: 1;
}

.filter-picker {
  background-color: #F1F5F9;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.filter-label {
  font-size: 24rpx;
  color: #64748B;
  white-space: nowrap;
}

.filter-value {
  flex: 1;
  font-size: 26rpx;
  font-weight: 600;
  color: #0F172A;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.date-range {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #F1F5F9;
  border-radius: 16rpx;
  padding: 0 16rpx;
  height: 72rpx;
}

.date-picker {
  flex: 1;
  display: flex;
  justify-content: center;
}

.date-text {
  font-size: 22rpx;
  color: #475569;
}

.date-sep {
  margin: 0 8rpx;
  color: #94A3B8;
}

.action-icons {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.icon-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F1F5F9;
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
  padding: 24rpx 32rpx 40rpx;
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
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(15, 23, 42, 0.03);
  transition: all 0.2s;

  &:active {
    transform: scale(0.99);
    background-color: #F8FAFC;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #0F172A;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-text {
  font-size: 26rpx;
  color: #64748B;
}

.card-footer {
  display: flex;
  align-items: center;
  border-top: 2rpx solid #F1F5F9;
  padding-top: 24rpx;
}

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
</style>
