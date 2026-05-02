<template>
  <view class="page">
    <view class="sticky-header">
      <view class="search-row">
        <view class="search-container">
          <up-search
            placeholder="搜索课程名称"
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
          <view class="icon-btn add-btn" @click="goCreate">
            <up-icon name="plus" size="40rpx" color="#FFFFFF" />
          </view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="list-scroll" @scrolltolower="onReachBottom">
      <view v-if="loading && rows.length === 0" class="state-container">
        <up-loading-icon text="正在加载课程..." size="32" color="#3B82F6" />
      </view>

      <view v-else-if="rows.length === 0" class="state-container">
        <up-empty mode="data" text="暂无课程记录" />
      </view>

      <view v-else class="list-padding">
        <view v-for="item in rows" :key="item.id" class="list-card" @click="goDetail(item.id)">
          <view class="card-header">
            <view class="title-group">
              <text class="card-title">{{ item.name }}</text>
              <text class="card-code">{{ item.courseCode }}</text>
            </view>
            <up-tag :text="item.status" :type="item.status === 'PLANNED' ? 'primary' : 'info'" size="mini" shape="circle" />
          </view>
          
          <view class="card-meta">
            <view class="meta-item">
              <up-icon name="account" size="24rpx" color="#94A3B8" />
              <text class="meta-text">{{ item.coachName || '待定教练' }}</text>
            </view>
            <view class="meta-item">
              <up-icon name="map" size="24rpx" color="#94A3B8" />
              <text class="meta-text">{{ item.venue || '未分配场地' }}</text>
            </view>
            <view class="meta-item">
              <up-icon name="calendar" size="24rpx" color="#94A3B8" />
              <text class="meta-text">{{ formatDateTime(item.startTime) }} ({{ item.durationMinutes }}分钟)</text>
            </view>
          </view>

          <view class="card-footer">
            <view class="stats">
              <text class="stat-text">已约: {{ item.bookedCount }}/{{ item.capacity }}</text>
            </view>
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
import { reactive, ref, watch } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { listCourses, type Course } from '@/api/modules/courses'
import { isLoggedIn } from '@/store/auth'
import { clearDraft, loadDraft, saveDraft } from '@/utils/draft'
import { showError } from '@/utils/error'

const QUERY_DRAFT_KEY = 'admin.courses.query'
const defaults = { page: 0, size: 10, name: '' }
const query = reactive({ ...defaults, ...loadDraft(QUERY_DRAFT_KEY, defaults) })\nconst loading = ref(false)
const rows = ref<Course[]>([])
const totalPages = ref(1)

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

async function fetchData() {
  if (loading.value) return
  loading.value = true
  try {
    const data = await listCourses({
      page: query.page,
      size: query.size,
      name: query.name.trim() || undefined
    })
    rows.value = data.content || []
    totalPages.value = data.totalPages || 1
  } catch (error) {
    showError(error, '课程列表获取失败')
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

function onReachBottom() {
  // Optional: implement load-more instead of pagination if preferred
}

function goCreate() {
  uni.navigateTo({ url: '/pages/admin/courses/form?mode=create' })
}

function goEdit(id: number) {
  uni.navigateTo({ url: `/pages/admin/courses/form?mode=edit&id=${id}` })
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/admin/courses/detail?id=${id}` })
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
}

.icon-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
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
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
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
  margin-bottom: 24rpx;

  .title-group {
    display: flex;
    flex-direction: column;
    gap: 4rpx;

    .card-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #0F172A;
    }

    .card-code {
      font-size: 22rpx;
      color: #94A3B8;
      font-family: monospace;
    }
  }
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .meta-text {
      font-size: 26rpx;
      color: #64748B;
    }
  }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 2rpx solid #F1F5F9;
  padding-top: 24rpx;

  .stat-text {
    font-size: 24rpx;
    font-weight: 600;
    color: #475569;
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
