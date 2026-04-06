<template>
  <view class="page">
    <view class="card">
      <view class="title" style="font-size: 30rpx">课程预约</view>
      <view class="sub-title" style="margin-top: 8rpx">先选择学员，再为其预约课程</view>

      <view style="margin-top: 14rpx">
        <view>选择学员</view>
        <picker :range="children" range-key="name" :value="childIndex" @change="onChildChange">
          <view class="picker">{{ selectedChildName }}</view>
        </picker>
      </view>

      <view style="margin-top: 14rpx">
        <view>备注（可选）</view>
        <input v-model="remark" class="input" maxlength="255" placeholder="例如：周末体验课" />
      </view>

      <view class="row gap" style="margin-top: 14rpx">
        <u-button size="small" type="primary" text="刷新课程" @click="fetchData" />
      </view>
    </view>

    <view v-if="loading" class="card">加载中...</view>
    <view v-else-if="courses.length === 0" class="card">暂无可预约课程</view>
    <view v-else>
      <view v-for="course in courses" :key="course.id" class="card">
        <view class="name">{{ course.name }}</view>
        <view class="sub-title" style="margin-top: 8rpx">
          编号：{{ course.courseCode }} / 教练：{{ course.coachName }}
        </view>
        <view class="sub-title">时间：{{ formatDateTime(course.startTime) }} / 时长：{{ course.durationMinutes }} 分钟</view>
        <view class="sub-title">地点：{{ course.venue }}</view>
        <view class="sub-title">
          名额：{{ course.bookedCount }}/{{ course.capacity }}，剩余 {{ course.availableCount }}
        </view>

        <view class="form-actions" style="margin-top: 12rpx">
          <u-button
            type="primary"
            text="预约该课程"
            :disabled="!selectedChildId || course.availableCount <= 0"
            @click="handleBooking(course.id)"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  createParentBooking,
  listParentChildren,
  listParentCourses,
  type ParentChild,
  type ParentCourse
} from '@/api/modules/parent'
import { isLoggedIn } from '@/store/auth'
import { showError, showSuccess } from '@/utils/error'

const loading = ref(false)
const children = ref<ParentChild[]>([])
const courses = ref<ParentCourse[]>([])
const childIndex = ref(0)
const remark = ref('')

const selectedChildId = computed(() => children.value[childIndex.value]?.id || 0)
const selectedChildName = computed(() => children.value[childIndex.value]?.name || '请先绑定学员')

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  return value.replace('T', ' ')
}

function onChildChange(event: any) {
  childIndex.value = Number(event.detail.value) || 0
}

async function fetchData() {
  if (!ensureLogin()) return
  loading.value = true
  try {
    const [childRows, courseRows] = await Promise.all([listParentChildren(), listParentCourses()])
    children.value = childRows
    courses.value = courseRows
    if (childIndex.value >= children.value.length) {
      childIndex.value = 0
    }
  } catch (error) {
    showError(error, '课程数据获取失败')
  } finally {
    loading.value = false
  }
}

async function handleBooking(courseId: number) {
  const studentId = selectedChildId.value
  if (!studentId) {
    uni.showToast({ title: '请先选择学员', icon: 'none' })
    return
  }
  try {
    await createParentBooking({
      studentId,
      courseId,
      remark: remark.value.trim() || undefined
    })
    showSuccess('预约成功')
    remark.value = ''
    fetchData()
  } catch (error) {
    showError(error, '预约失败')
  }
}

onLoad(fetchData)
onShow(fetchData)
</script>

<style scoped lang="scss">
.name {
  font-size: 30rpx;
  font-weight: 700;
}

.picker,
.input {
  margin-top: 10rpx;
  background: #f9fafb;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
}
</style>

