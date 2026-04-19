# 教练端与学生端首页重构 (B3方案) 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将教练端和学生端的首页重构为基于“顶部水平日期条 + 下方纵向日程流”的任务驱动型界面。

**Architecture:** 
采用 Vue 3 `<script setup>` 结合 `uview-plus` UI 库。顶部数据概览区域精简，核心部分由一个自定义的横向日期滑动组件和一个基于 Flex 布局的日程列表组件组成。数据根据选中的日期进行过滤展示。
考虑到后端接口目前可能不支持直接按单个日期筛选，前端将获取所有数据并根据 `startTime` 字段在本地进行日期过滤。

**Tech Stack:** Vue 3 (Composition API), TypeScript, uview-plus, UniApp (微信小程序)

---

### Task 1: 创建公共业务组件 - 水平日期滑动条

**Files:**
- Create: `src/components/date-slider/date-slider.vue`

- [ ] **Step 1: 创建 date-slider 组件**
  - 在 `src/components/date-slider/date-slider.vue` 中，实现一个基于 `scroll-view` 的横向滚动条。
  - 生成当前日期及前后各一周（共 15 天）的日期数组作为数据源。

```vue
<template>
  <scroll-view class="date-slider" scroll-x :scroll-into-view="scrollIntoId" scroll-with-animation>
    <view class="date-list">
      <view
        v-for="(item, index) in dateList"
        :key="item.date"
        :id="'date-' + index"
        class="date-item"
        :class="{ active: item.date === modelValue }"
        @click="selectDate(item.date)"
      >
        <text class="week">{{ item.week }}</text>
        <text class="day">{{ item.day }}</text>
        <view class="dot" :class="{ 'has-event': item.hasEvent }"></view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  modelValue: string // YYYY-MM-DD
  events?: string[] // 有事件的日期数组 ['2026-04-18']
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const dateList = ref<Array<{ date: string; day: string; week: string; hasEvent: boolean }>>([])
const scrollIntoId = ref('')

const weekMap = ['日', '一', '二', '三', '四', '五', '六']

function generateDates() {
  const list = []
  const today = new Date()
  // 生成前后各7天
  for (let i = -7; i <= 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    list.push({
      date: dateStr,
      day: day,
      week: weekMap[d.getDay()],
      hasEvent: props.events?.includes(dateStr) ?? false
    })
  }
  dateList.value = list
  
  // 滚动到选中的日期
  const activeIndex = list.findIndex(item => item.date === props.modelValue)
  if (activeIndex > -1) {
    const targetIndex = Math.max(0, activeIndex - 2)
    scrollIntoId.value = 'date-' + targetIndex
  }
}

watch(() => props.events, () => {
  generateDates()
}, { deep: true })

function selectDate(date: string) {
  emit('update:modelValue', date)
  emit('change', date)
}

onMounted(() => {
  generateDates()
})
</script>

<style scoped lang="scss">
.date-slider {
  width: 100%;
  white-space: nowrap;
  background-color: #ffffff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f3f4f6;
}
.date-list {
  display: inline-flex;
  padding: 0 20rpx;
}
.date-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90rpx;
  height: 110rpx;
  margin: 0 10rpx;
  border-radius: 16rpx;
  background-color: #f8fafc;
  transition: all 0.2s;

  &.active {
    background-color: #3b82f6;
    color: #ffffff;
    
    .week, .day { color: #ffffff; }
  }

  .week {
    font-size: 24rpx;
    color: #6b7280;
    margin-bottom: 8rpx;
  }
  .day {
    font-size: 32rpx;
    font-weight: bold;
    color: #111827;
  }
  .dot {
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    margin-top: 6rpx;
    background-color: transparent;
    
    &.has-event {
      background-color: #ef4444;
    }
  }
  
  &.active .dot.has-event {
    background-color: #ffffff;
  }
}
</style>
```

- [ ] **Step 2: 验证组件无语法错误**
  - 运行 `npm run type-check` 确保 `date-slider.vue` 没有 TS 错误。

---

### Task 2: 重构教练端首页 (Admin Home)

**Files:**
- Modify: `src/pages/admin/home.vue`

- [ ] **Step 1: 引入日期组件并重构布局结构**
  - 替换原有的九宫格为“精简数据卡片” + “水平日期选择器” + “课程日程卡片流”。
  - 保留必要的 API 导入。

```vue
<template>
  <view class="page">
    <view class="summary-bar">
      <view class="summary-item">
        <text class="label">今日课程</text>
        <text class="value">{{ stats.todayCourses }}</text>
      </view>
      <view class="summary-item">
        <text class="label">待签到</text>
        <text class="value">{{ stats.pendingSignIns }}</text>
      </view>
    </view>

    <date-slider v-model="selectedDate" :events="courseDates" @change="filterCourses" />

    <view class="schedule-stream">
      <template v-if="displayCourses.length > 0">
        <view class="course-card" v-for="course in displayCourses" :key="course.id">
          <view class="card-header">
            <view class="time">{{ formatTime(course.startTime) }} - {{ calculateEndTime(course.startTime, course.durationMinutes) }}</view>
            <view class="status">{{ course.status }}</view>
          </view>
          <view class="card-body">
            <view class="course-name">{{ course.name }}</view>
            <view class="course-info">
              <text>类型: {{ course.courseType }}</text>
              <text class="divider">|</text>
              <text>场地: {{ course.venue }}</text>
            </view>
          </view>
          <view class="card-actions">
            <u-button size="small" type="primary" plain text="录入体测" @click="goFitness" />
            <u-button size="small" type="primary" text="考勤管理" @click="goAttendances" />
          </view>
        </view>
      </template>
      <template v-else>
        <view style="padding: 40rpx; text-align: center; color: #9ca3af;">
          <text>所选日期无课程安排</text>
        </view>
      </template>
    </view>

    <view class="fab-btn" @click="goCourses">
      <text style="color: white; font-size: 40rpx">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { listCourses } from '@/api/modules/courses'
import type { Course } from '@/api/modules/courses'
import { getAuth, isLoggedIn } from '@/store/auth'
import DateSlider from '@/components/date-slider/date-slider.vue'

const selectedDate = ref(new Date().toISOString().split('T')[0])
const allCourses = ref<Course[]>([])
const displayCourses = ref<Course[]>([])
const stats = reactive({ todayCourses: 0, pendingSignIns: 0 })

const courseDates = computed(() => {
  const dates = new Set<string>()
  allCourses.value.forEach(c => {
    if (c.startTime) {
      dates.add(c.startTime.split(' ')[0])
    }
  })
  return Array.from(dates)
})

function formatTime(timeStr: string) {
  if (!timeStr) return ''
  return timeStr.split(' ')[1]?.substring(0, 5) || timeStr
}

function calculateEndTime(startTimeStr: string, durationMinutes: number) {
  if (!startTimeStr || !durationMinutes) return ''
  // 假设格式为 "YYYY-MM-DD HH:mm:00"
  const parts = startTimeStr.split(' ')
  if (parts.length !== 2) return ''
  const timeParts = parts[1].split(':')
  const date = new Date()
  date.setHours(parseInt(timeParts[0], 10))
  date.setMinutes(parseInt(timeParts[1], 10) + durationMinutes)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function fetchAllCourses() {
  try {
    const res = await listCourses({ page: 0, size: 100 })
    allCourses.value = res.content || []
    
    // 统计今天的数据
    const today = new Date().toISOString().split('T')[0]
    const todayList = allCourses.value.filter(c => c.startTime && c.startTime.startsWith(today))
    stats.todayCourses = todayList.length
    // 简化处理，待签到数暂时用课程数模拟或设为0
    stats.pendingSignIns = todayList.length > 0 ? todayList.length * 5 : 0 
    
    filterCourses(selectedDate.value)
  } catch (e) {
    console.error('Failed to load courses', e)
  }
}

function filterCourses(date: string) {
  displayCourses.value = allCourses.value.filter(c => c.startTime && c.startTime.startsWith(date))
}

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function goAttendances() { uni.navigateTo({ url: '/pages/admin/attendances/list' }) }
function goFitness() { uni.navigateTo({ url: '/pages/admin/fitness/list' }) }
function goCourses() { uni.navigateTo({ url: '/pages/admin/courses/list' }) }

onLoad(() => { if (ensureLogin()) fetchAllCourses() })
onShow(() => { if (ensureLogin()) fetchAllCourses() })
</script>

<style scoped lang="scss">
.summary-bar {
  display: flex;
  justify-content: space-around;
  background-color: #3b82f6; 
  color: #fff;
  padding: 30rpx 0;
  
  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    .label { font-size: 24rpx; opacity: 0.9; margin-bottom: 8rpx; }
    .value { font-size: 40rpx; font-weight: bold; }
  }
}

.schedule-stream {
  padding: 24rpx;
}

.course-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e5e7eb;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .time { font-size: 32rpx; font-weight: bold; color: #111827; }
    .status { font-size: 24rpx; padding: 4rpx 12rpx; border-radius: 8rpx; background: #dbeafe; color: #1d4ed8; }
  }

  .course-name { font-size: 30rpx; font-weight: 500; margin-bottom: 12rpx; }
  .course-info { font-size: 26rpx; color: #6b7280; margin-bottom: 24rpx; }
  .divider { margin: 0 12rpx; color: #d1d5db; }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16rpx;
    border-top: 1rpx solid #f3f4f6;
    padding-top: 16rpx;
  }
}

.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 16rpx rgba(59,130,246,0.4);
  z-index: 99;
}
</style>
```

- [ ] **Step 2: 验证组件无语法错误**
  - 运行 `npm run type-check` 确保 `home.vue` 没有 TS 错误。

---

### Task 3: 重构学生端首页 (Student Home)

**Files:**
- Modify: `src/pages/student/home.vue`

- [ ] **Step 1: 应用相同的设计模式到学生端**
  - 引入 `date-slider` 组件。
  - 下方卡片流调整为学生视角的课程展示。

```vue
<template>
  <view class="page">
    <view class="summary-bar">
      <view class="summary-item">
        <text class="label">我的课程</text>
        <text class="value">{{ allCourses.length }}</text>
      </view>
      <view class="summary-item" v-if="profile">
        <text class="label">学员姓名</text>
        <text class="value" style="font-size: 32rpx; margin-top: 8rpx;">{{ profile.name }}</text>
      </view>
    </view>

    <date-slider v-model="selectedDate" :events="courseDates" @change="filterCourses" />

    <view class="schedule-stream">
      <template v-if="displayCourses.length > 0">
        <view class="course-card" v-for="course in displayCourses" :key="course.id">
          <view class="card-header">
            <view class="time">{{ formatTime(course.startTime) }} - {{ calculateEndTime(course.startTime, course.durationMinutes) }}</view>
            <view class="status">{{ course.status }}</view>
          </view>
          <view class="card-body">
            <view class="course-name">{{ course.name }}</view>
            <view class="course-info">
              <text>教练: {{ course.coachName }}</text>
              <text class="divider">|</text>
              <text>场地: {{ course.venue }}</text>
            </view>
          </view>
          <view class="card-actions">
            <u-button size="small" type="primary" text="查看详情" @click="goCourseDetail(course.id)" />
          </view>
        </view>
      </template>
      <template v-else>
        <view style="padding: 40rpx; text-align: center; color: #9ca3af;">
          <text>所选日期无课程安排，好好休息吧</text>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getStudentProfile, listStudentCourses } from '@/api/modules/student'
import type { StudentProfile, StudentCourse } from '@/api/modules/student'
import { getAuth, isLoggedIn } from '@/store/auth'
import DateSlider from '@/components/date-slider/date-slider.vue'

const selectedDate = ref(new Date().toISOString().split('T')[0])
const allCourses = ref<StudentCourse[]>([])
const displayCourses = ref<StudentCourse[]>([])
const profile = ref<StudentProfile | null>(null)

const courseDates = computed(() => {
  const dates = new Set<string>()
  allCourses.value.forEach(c => {
    if (c.startTime) {
      dates.add(c.startTime.split(' ')[0])
    }
  })
  return Array.from(dates)
})

function formatTime(timeStr: string) {
  if (!timeStr) return ''
  return timeStr.split(' ')[1]?.substring(0, 5) || timeStr
}

function calculateEndTime(startTimeStr: string, durationMinutes: number) {
  if (!startTimeStr || !durationMinutes) return ''
  const parts = startTimeStr.split(' ')
  if (parts.length !== 2) return ''
  const timeParts = parts[1].split(':')
  const date = new Date()
  date.setHours(parseInt(timeParts[0], 10))
  date.setMinutes(parseInt(timeParts[1], 10) + durationMinutes)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function loadData() {
  try {
    profile.value = await getStudentProfile()
    const courses = await listStudentCourses()
    allCourses.value = courses || []
    filterCourses(selectedDate.value)
  } catch (e) {
    console.error('Failed to load student data', e)
  }
}

function filterCourses(date: string) {
  displayCourses.value = allCourses.value.filter(c => c.startTime && c.startTime.startsWith(date))
}

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function goCourseDetail(id: number) {
  uni.navigateTo({ url: '/pages/student/courses/list' })
}

onLoad(() => { if (ensureLogin()) loadData() })
onShow(() => { if (ensureLogin()) loadData() })
</script>

<style scoped lang="scss">
.summary-bar {
  display: flex;
  justify-content: space-around;
  background-color: #10b981; /* 绿色系给学生端以示区分 */
  color: #fff;
  padding: 30rpx 0;
  
  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    .label { font-size: 24rpx; opacity: 0.9; margin-bottom: 8rpx; }
    .value { font-size: 40rpx; font-weight: bold; }
  }
}

.schedule-stream {
  padding: 24rpx;
}

.course-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e5e7eb;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .time { font-size: 32rpx; font-weight: bold; color: #111827; }
    .status { font-size: 24rpx; padding: 4rpx 12rpx; border-radius: 8rpx; background: #d1fae5; color: #047857; }
  }

  .course-name { font-size: 30rpx; font-weight: 500; margin-bottom: 12rpx; }
  .course-info { font-size: 26rpx; color: #6b7280; margin-bottom: 24rpx; }
  .divider { margin: 0 12rpx; color: #d1d5db; }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16rpx;
    border-top: 1rpx solid #f3f4f6;
    padding-top: 16rpx;
  }
}
</style>
```

- [ ] **Step 2: 验证样式与接口**
  - 运行 `npm run type-check` 验证学生端组件 TS。

---

### Task 4: 构建验证

- [ ] **Step 1: 运行构建测试**
  - 运行 `npm run build:mp-weixin` 确保构建成功，无模块遗漏。
