<template>
  <view class="page">
    <view class="sticky-header">
      <view class="search-row">
        <view class="search-container">
          <up-search
            placeholder="搜索学员姓名"
            v-model="query.name"
            :show-action="false"
            @search="handleSearch"
            @clear="handleReset"
            shape="round"
            bg-color="#F1F5F9"
            height="72rpx"
          />
        </view>
        <view class="action-icons">
          <picker :range="statusOptions" range-key="label" :value="statusIndex" @change="onStatusChange">
            <view class="icon-btn">
              <up-icon name="filter" size="40rpx" color="#64748B" />
            </view>
          </picker>
          <view class="icon-btn add-btn" @click="goCreate">
            <up-icon name="plus" size="40rpx" color="#FFFFFF" />
          </view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="list-scroll">
      <view v-if="loading && rows.length === 0" class="state-container">
        <up-loading-icon text="正在加载学员..." size="32" color="#3B82F6" />
      </view>

      <view v-else-if="rows.length === 0" class="state-container">
        <up-empty mode="data" text="暂无学员记录" />
      </view>

      <view v-else class="list-padding">
        <view v-for="item in rows" :key="item.id" class="list-card" @click="goDetail(item.id)">
          <view class="card-header">
            <text class="card-title">{{ item.name }}</text>
            <up-tag :text="statusText(item.status)" :type="statusTagType(item.status)" size="mini" shape="circle" />
          </view>
          
          <view class="card-meta">
            <view class="meta-item">
              <up-icon name="account" size="24rpx" color="#94A3B8" />
              <text class="meta-text">学号：{{ item.studentNo }}</text>
            </view>
            <view class="meta-item">
              <up-icon name="man-add" size="24rpx" color="#94A3B8" />
              <text class="meta-text">性别：{{ genderText(item.gender) }}</text>
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

        <view class="pagination-footer" v-if="totalPages > 1">
          <view class="page-btn" :class="{ disabled: query.page <= 0 }" @click="prevPage">
            <up-icon name="arrow-left" size="28rpx" :color="query.page <= 0 ? '#CBD5E1' : '#475569'" />
          </view>
          <text class="page-info">{{ query.page + 1 }} / {{ totalPages }}</text>
          <view class="page-btn" :class="{ disabled: query.page + 1 >= totalPages }" @click="nextPage">
            <up-icon name="arrow-right" size="28rpx" :color="query.page + 1 >= totalPages ? '#CBD5E1' : '#475569'" />
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { listStudents, type Student } from '@/api/modules/students'
import { isLoggedIn } from '@/store/auth'
import { clearDraft, loadDraft, saveDraft } from '@/utils/draft'
import { showError } from '@/utils/error'
import { findLabel, genderOptions, studentStatusOptions } from '@/constants/enums'

const QUERY_DRAFT_KEY = 'students.query'
const defaults = { page: 0, size: 10, name: '', status: '' }
const query = reactive({ ...defaults, ...loadDraft(QUERY_DRAFT_KEY, defaults) })
const loading = ref(false)
const rows = ref<Student[]>([])
const totalPages = ref(1)

const statusOptions = [{ label: '全部', value: '' }, ...studentStatusOptions]
const statusIndex = computed(() => statusOptions.findIndex(item => item.value === query.status))

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function genderText(value: string) { return findLabel(genderOptions, value) }
function statusText(value: string) { return findLabel(studentStatusOptions, value) }
function statusTagType(status: string) {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'GRADUATED': return 'warning'
    default: return 'info'
  }
}

async function fetchData() {
  if (loading.value) return
  loading.value = true
  try {
    const data = await listStudents({
      page: query.page,
      size: query.size,
      name: query.name.trim() || undefined,
      status: query.status || undefined
    })
    rows.value = data.content || []
    totalPages.value = data.totalPages || 1
  } catch (error) {
    showError(error, '学员列表获取失败')
  } finally {
    loading.value = false
  }
}

onPullDownRefresh(async () => {
  query.page = 0
  await fetchData()
  uni.stopPullDownRefresh()
})

function handleSearch() {
  query.page = 0
  fetchData()
}

function handleReset() {
  Object.assign(query, defaults)
  clearDraft(QUERY_DRAFT_KEY)
  fetchData()
}

function onStatusChange(e: any) {
  query.status = statusOptions[Number(e.detail.value)]?.value || ''
  handleSearch()
}

function prevPage() {
  if (query.page > 0) {
    query.page--
    fetchData()
  }
}

function nextPage() {
  if (query.page + 1 < totalPages.value) {
    query.page++
    fetchData()
  }
}

function goCreate() {
  uni.navigateTo({ url: '/pages/admin/students/form?mode=create' })
}

function goEdit(id: number) {
  uni.navigateTo({ url: `/pages/admin/students/form?mode=edit&id=${id}` })
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/admin/students/detail?id=${id}` })
}

watch(() => ({ ...query }), (v) => saveDraft(QUERY_DRAFT_KEY, v), { deep: true })

onLoad(() => {
  if (ensureLogin()) fetchData()
})

onShow(() => {
  if (ensureLogin()) fetchData()
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
  z-index: 10;
  background: #fff;
  padding: 20rpx 32rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.search-container {
  flex: 1;
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
  padding: 24rpx 0 40rpx;
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
  margin: 0 32rpx 24rpx;
  border: 1rpx solid #E2E8F0;
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
    background-color: #F8FAFC;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;

  .card-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #0F172A;
    line-height: 1.4;
  }
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 24rpx;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .meta-text {
    font-size: 26rpx;
    color: #64748B;
  }
}

.card-footer {
  display: flex;
  align-items: center;
  border-top: 2rpx solid #F1F5F9;
  padding-top: 24rpx;

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
}

.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
  margin-top: 16rpx;
  padding-bottom: 40rpx;
}

.page-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  &.disabled {
    opacity: 0.5;
  }
}

.page-info {
  font-size: 26rpx;
  font-weight: 600;
  color: #475569;
}
</style>
