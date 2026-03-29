<template>
  <view class="page">
    <view class="card">
      <view class="title">考勤管理</view>

      <view style="margin-top: 16rpx">
        <view>学员筛选</view>
        <picker :range="studentOptions" range-key="name" :value="studentIndex" @change="onStudentChange">
          <view class="picker">{{ studentLabel }}</view>
        </picker>
      </view>

      <view style="margin-top: 16rpx">
        <view>课程筛选</view>
        <picker :range="courseOptions" range-key="name" :value="courseIndex" @change="onCourseChange">
          <view class="picker">{{ courseLabel }}</view>
        </picker>
      </view>

      <view style="margin-top: 16rpx">
        <view>开始日期</view>
        <picker mode="date" :value="query.startDate" @change="onStartDateChange">
          <view class="picker">{{ query.startDate || '请选择开始日期' }}</view>
        </picker>
      </view>

      <view style="margin-top: 16rpx">
        <view>结束日期</view>
        <picker mode="date" :value="query.endDate" @change="onEndDateChange">
          <view class="picker">{{ query.endDate || '请选择结束日期' }}</view>
        </picker>
      </view>

      <view class="row gap" style="margin-top: 18rpx">
        <u-button type="primary" text="查询" @click="fetchData" />
        <u-button text="重置" @click="handleReset" />
        <u-button type="success" text="新增考勤" @click="goCreate" />
      </view>
    </view>

    <view v-if="loading" class="card">加载中...</view>

    <view v-else>
      <view v-for="item in rows" :key="item.id" class="card">
        <view style="font-size: 30rpx; font-weight: 600">{{ item.studentName }}</view>
        <view class="sub-title" style="margin-top: 8rpx">课程：{{ item.courseName }}</view>
        <view class="sub-title">日期：{{ item.attendanceDate }}</view>
        <view class="sub-title">状态：{{ statusText(item.status) }}</view>
        <view class="sub-title">备注：{{ item.note || '-' }}</view>
      </view>

      <view v-if="!rows.length" class="card">暂无考勤记录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { listAttendances, type AttendanceQuery } from '@/api/modules/attendance'
import { listCourses, type Course } from '@/api/modules/courses'
import { listStudents, type Student } from '@/api/modules/students'
import { isLoggedIn } from '@/store/auth'
import { clearDraft, loadDraft, saveDraft } from '@/utils/draft'
import { showError } from '@/utils/error'
import { attendanceStatusOptions, findLabel } from '@/constants/enums'
import type { AttendanceRecord } from '@/types/api'

const QUERY_DRAFT_KEY = 'attendances.query'
const defaults: AttendanceQuery = {
  studentId: undefined,
  courseId: undefined,
  startDate: '',
  endDate: ''
}

const query = reactive({
  ...defaults,
  ...loadDraft(QUERY_DRAFT_KEY, defaults)
})

const loading = ref(false)
const rows = ref<AttendanceRecord[]>([])
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

function statusText(value: string) {
  return findLabel(attendanceStatusOptions, value)
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
  loading.value = true
  try {
    rows.value = await listAttendances({
      studentId: query.studentId || undefined,
      courseId: query.courseId || undefined,
      startDate: query.startDate || undefined,
      endDate: query.endDate || undefined
    })
  } catch (error) {
    showError(error, '考勤列表获取失败')
  } finally {
    loading.value = false
  }
}

function onStudentChange(event: any) {
  const index = Number(event.detail.value)
  query.studentId = studentOptions.value[index]?.id || undefined
}

function onCourseChange(event: any) {
  const index = Number(event.detail.value)
  query.courseId = courseOptions.value[index]?.id || undefined
}

function onStartDateChange(event: any) {
  query.startDate = event.detail.value
}

function onEndDateChange(event: any) {
  query.endDate = event.detail.value
}

function handleReset() {
  Object.assign(query, defaults)
  clearDraft(QUERY_DRAFT_KEY)
  fetchData()
}

function goCreate() {
  uni.navigateTo({ url: '/pages/admin/attendances/form' })
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
.picker {
  background: #f9fafb;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  margin-top: 10rpx;
}
</style>
