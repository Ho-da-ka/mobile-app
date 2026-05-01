<template>
  <view class="page">
    <!-- Sticky Search Header (Filters for Fitness) -->
    <view class="sticky-header">
      <view class="search-row">
        <view class="search-container">
          <picker :range="studentOptions" range-key="name" :value="studentIndex" @change="onStudentChange">
            <view class="filter-picker">
              <u-icon name="account" size="32rpx" color="#64748B" />
              <text class="filter-label">学员:</text>
              <text class="filter-value u-line-1">{{ studentLabel }}</text>
              <u-icon name="arrow-down" size="24rpx" color="#64748B" />
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
        <u-loading-icon text="正在加载体测..." size="32" />
      </view>

      <view v-else-if="rows.length === 0" class="state-container">
        <u-empty mode="data" text="暂无体测记录" />
      </view>

      <view v-else class="list-padding">
        <view v-for="item in rows" :key="item.id" class="list-card">
          <view class="card-header">
            <text class="card-title">{{ item.studentName }}</text>
            <view class="date-tag">{{ item.testDate }}</view>
          </view>
          
          <view class="card-meta">
            <view class="meta-item">
              <u-icon name="file-text" size="24rpx" color="#94A3B8" />
              <text class="meta-text">项目：{{ item.itemName }}</text>
            </view>
            <view class="meta-item">
              <u-icon name="level" size="24rpx" color="#94A3B8" />
              <text class="meta-text result">结果：{{ item.testValue }} {{ item.unit }}</text>
            </view>
            <view v-if="item.comment" class="meta-item">
              <u-icon name="chat" size="24rpx" color="#94A3B8" />
              <text class="meta-text">评语：{{ item.comment }}</text>
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
  if (loading.value) return
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
  fetchData()
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

.search-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.search-container {
  flex: 1;
}

.filter-picker {
  background-color: #F1F5F9;
  border-radius: 16rpx;
  padding: 0 24rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
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

.date-tag {
  font-size: 22rpx;
  color: #94A3B8;
  background-color: #F8FAFC;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-text {
  font-size: 26rpx;
  color: #64748B;
  
  &.result {
    color: #3B82F6;
    font-weight: 600;
  }
}
</style>
