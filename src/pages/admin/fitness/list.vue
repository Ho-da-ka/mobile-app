<template>
  <view class="page">
    <view class="card">
      <view class="title">体测管理</view>

      <view style="margin-top: 16rpx">
        <view>学员筛选</view>
        <picker :range="studentOptions" range-key="name" :value="studentIndex" @change="onStudentChange">
          <view class="picker">{{ studentLabel }}</view>
        </picker>
      </view>

      <view class="row gap" style="margin-top: 18rpx">
        <u-button type="primary" text="查询" @click="fetchData" />
        <u-button text="重置" @click="handleReset" />
        <u-button type="success" text="新增体测" @click="goCreate" />
      </view>
    </view>

    <view v-if="loading" class="card">加载中...</view>

    <view v-else>
      <view v-for="item in rows" :key="item.id" class="card">
        <view style="font-size: 30rpx; font-weight: 600">{{ item.studentName }}</view>
        <view class="sub-title" style="margin-top: 8rpx">日期：{{ item.testDate }}</view>
        <view class="sub-title">项目：{{ item.itemName }}</view>
        <view class="sub-title">结果：{{ item.testValue }} {{ item.unit }}</view>
        <view class="sub-title">评语：{{ item.comment || '-' }}</view>
      </view>

      <view v-if="!rows.length" class="card">暂无体测记录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { listFitnessTests } from '@/api/modules/fitness'
import { listStudents, type Student } from '@/api/modules/students'
import { isLoggedIn } from '@/store/auth'
import { clearDraft, loadDraft, saveDraft } from '@/utils/draft'
import { showError } from '@/utils/error'
import type { FitnessTestRecord } from '@/types/api'

const QUERY_DRAFT_KEY = 'fitness.query'
const defaults = { studentId: undefined as number | undefined }

const query = reactive({
  ...defaults,
  ...loadDraft(QUERY_DRAFT_KEY, defaults)
})

const loading = ref(false)
const rows = ref<FitnessTestRecord[]>([])
const studentOptions = ref<Array<Student & { name: string }>>([{ id: 0, name: '全部学员' } as Student & { name: string }])

const studentIndex = computed(() => studentOptions.value.findIndex(item => item.id === (query.studentId || 0)))
const studentLabel = computed(() => studentOptions.value[studentIndex.value]?.name || '全部学员')

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

async function loadOptions() {
  const students = await listStudents({ page: 0, size: 200 })
  studentOptions.value = [{ id: 0, name: '全部学员' } as Student & { name: string }, ...students.content]
}

async function fetchData() {
  loading.value = true
  try {
    rows.value = await listFitnessTests({
      studentId: query.studentId || undefined
    })
  } catch (error) {
    showError(error, '体测列表获取失败')
  } finally {
    loading.value = false
  }
}

function onStudentChange(event: any) {
  const index = Number(event.detail.value)
  query.studentId = studentOptions.value[index]?.id || undefined
}

function handleReset() {
  Object.assign(query, defaults)
  clearDraft(QUERY_DRAFT_KEY)
  fetchData()
}

function goCreate() {
  uni.navigateTo({ url: '/pages/admin/fitness/form' })
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
