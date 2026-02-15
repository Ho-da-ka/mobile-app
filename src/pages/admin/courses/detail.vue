<template>
  <view class="page">
    <view class="card" v-if="loading">加载中...</view>

    <view class="card" v-else-if="course">
      <view class="title">{{ course.name }}</view>
      <view class="sub-title" style="margin-top: 10rpx">课程编码：{{ course.courseCode }}</view>

      <view class="field"><text class="key">课程类型</text><text>{{ course.courseType || '-' }}</text></view>
      <view class="field"><text class="key">教练姓名</text><text>{{ course.coachName || '-' }}</text></view>
      <view class="field"><text class="key">场地</text><text>{{ course.venue || '-' }}</text></view>
      <view class="field"><text class="key">开始时间</text><text>{{ course.startTime || '-' }}</text></view>
      <view class="field"><text class="key">时长</text><text>{{ course.durationMinutes }} 分钟</text></view>
      <view class="field"><text class="key">状态</text><text>{{ statusText(course.status) }}</text></view>
      <view class="field"><text class="key">描述</text><text>{{ course.description || '-' }}</text></view>

      <view class="form-actions">
        <u-button text="返回" @click="goBack" />
        <u-button type="primary" text="编辑" @click="goEdit" />
      </view>
    </view>

    <view class="card" v-else>未找到课程信息</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCourse, type Course } from '@/api/modules/courses'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'
import { courseStatusOptions, findLabel } from '@/constants/enums'

const loading = ref(false)
const course = ref<Course | null>(null)
const courseId = ref(0)

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function statusText(value: string) {
  return findLabel(courseStatusOptions, value)
}

async function fetchDetail() {
  if (!courseId.value) return
  loading.value = true
  try {
    course.value = await getCourse(courseId.value)
  } catch (error) {
    showError(error, '获取课程详情失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

function goEdit() {
  if (!courseId.value) return
  uni.navigateTo({ url: `/pages/admin/courses/form?mode=edit&id=${courseId.value}` })
}

onLoad((query) => {
  if (!ensureLogin()) return
  courseId.value = Number(query?.id || 0)
  if (!courseId.value) {
    uni.showToast({ title: '缺少课程ID', icon: 'none' })
    return
  }
  fetchDetail()
})
</script>

<style scoped lang="scss">
.field {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}

.key {
  color: #6b7280;
}
</style>

