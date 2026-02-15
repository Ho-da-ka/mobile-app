<template>
  <view class="page">
    <view class="card" v-if="loading">加载中...</view>

    <view class="card" v-else-if="student">
      <view class="title">{{ student.name }}</view>
      <view class="sub-title" style="margin-top: 10rpx">学号：{{ student.studentNo }}</view>

      <view class="field"><text class="key">性别</text><text>{{ genderText(student.gender) }}</text></view>
      <view class="field"><text class="key">出生日期</text><text>{{ student.birthDate || '-' }}</text></view>
      <view class="field"><text class="key">监护人</text><text>{{ student.guardianName || '-' }}</text></view>
      <view class="field"><text class="key">监护电话</text><text>{{ student.guardianPhone || '-' }}</text></view>
      <view class="field"><text class="key">状态</text><text>{{ statusText(student.status) }}</text></view>
      <view class="field"><text class="key">备注</text><text>{{ student.remarks || '-' }}</text></view>

      <view class="form-actions">
        <u-button text="返回" @click="goBack" />
        <u-button type="primary" text="编辑" @click="goEdit" />
      </view>
    </view>

    <view class="card" v-else>未找到学员信息</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStudent, type Student } from '@/api/modules/students'
import { isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'
import { findLabel, genderOptions, studentStatusOptions } from '@/constants/enums'

const loading = ref(false)
const student = ref<Student | null>(null)
const studentId = ref(0)

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function genderText(value: string) {
  return findLabel(genderOptions, value)
}

function statusText(value: string) {
  return findLabel(studentStatusOptions, value)
}

async function fetchDetail() {
  if (!studentId.value) return
  loading.value = true
  try {
    student.value = await getStudent(studentId.value)
  } catch (error) {
    showError(error, '获取学员详情失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

function goEdit() {
  if (!studentId.value) return
  uni.navigateTo({ url: `/pages/admin/students/form?mode=edit&id=${studentId.value}` })
}

onLoad((query) => {
  if (!ensureLogin()) return
  studentId.value = Number(query?.id || 0)
  if (!studentId.value) {
    uni.showToast({ title: '缺少学员ID', icon: 'none' })
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

