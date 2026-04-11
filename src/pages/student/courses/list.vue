<template>
  <view class="page">
    <view class="card row between">
      <view class="title">我的课程</view>
      <u-button size="mini" type="primary" plain text="刷新" :loading="loading" @click="loadData" />
    </view>

    <view v-if="loading" class="card">加载中...</view>
    <view v-else-if="rows.length === 0" class="card">暂无课程记录</view>
    <view v-else>
      <view v-for="item in rows" :key="item.id" class="card">
        <view class="row between">
          <view>
            <view style="font-size: 30rpx; font-weight: 600">{{ item.name }}</view>
            <view class="sub-title" style="margin-top: 8rpx">课程编码：{{ item.courseCode }}</view>
            <view class="sub-title">课程类型：{{ item.courseType }}</view>
            <view class="sub-title">教练：{{ item.coachName }} / 场地：{{ item.venue }}</view>
            <view class="sub-title">开始时间：{{ formatDateTime(item.startTime) }}</view>
            <view class="sub-title">时长：{{ item.durationMinutes }} 分钟</view>
            <view class="sub-title">
              状态：{{ item.status }}<text v-if="item.bookingStatus"> / 预约：{{ item.bookingStatus }}</text
              ><text v-if="item.checkinStatus"> / 签到：{{ item.checkinStatus }}</text>
            </view>
          </view>
        </view>
        <view v-if="item.description" class="sub-title" style="margin-top: 8rpx">说明：{{ item.description }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { listStudentCourses, type StudentCourse } from '@/api/modules/student'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const loading = ref(false)
const rows = ref<StudentCourse[]>([])

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

async function loadData() {
  if (!ensureLogin()) return
  loading.value = true
  try {
    rows.value = await listStudentCourses()
  } catch (error) {
    showError(error, '课程数据加载失败')
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  loadData()
})

onShow(() => {
  loadData()
})
</script>
