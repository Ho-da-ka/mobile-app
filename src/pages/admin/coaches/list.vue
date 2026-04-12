<template>
  <view class="page">
    <view class="card">
      <view class="title">教练管理</view>

      <view style="margin-top: 16rpx">
        <view>姓名筛选</view>
        <input class="input" v-model="query.name" placeholder="按教练姓名搜索" />
      </view>

      <view style="margin-top: 16rpx">
        <view>状态筛选</view>
        <picker :range="statusOptions" range-key="label" :value="statusIndex" @change="onStatusChange">
          <view class="picker">{{ statusLabel }}</view>
        </picker>
      </view>

      <view class="row gap" style="margin-top: 18rpx">
        <u-button type="primary" text="查询" @click="handleSearch" />
        <u-button text="重置" @click="handleReset" />
        <u-button v-if="isAdmin" type="success" text="新增教练" @click="goCreate" />
      </view>
    </view>

    <view v-if="loading" class="card">加载中...</view>

    <view v-else>
      <view v-for="item in rows" :key="item.id" class="card">
        <view class="row between">
          <view>
            <view style="font-size: 30rpx; font-weight: 600">{{ item.name }}</view>
            <view class="sub-title" style="margin-top: 8rpx">编号：{{ item.coachCode }}</view>
            <view class="sub-title">性别：{{ genderText(item.gender) }} / 状态：{{ statusText(item.status) }}</view>
            <view class="sub-title">手机号：{{ item.phone || '-' }}</view>
          </view>
          <view class="row" style="gap: 10rpx; flex-wrap: wrap; justify-content: flex-end">
            <u-button size="mini" text="详情" @click="goDetail(item.id)" />
            <u-button v-if="isAdmin" size="mini" type="primary" text="编辑" @click="goEdit(item.id)" />
            <u-button v-if="isAdmin" size="mini" type="error" text="删除" @click="handleDelete(item)" />
          </view>
        </view>
      </view>

      <view class="card row between">
        <u-button size="small" text="上一页" :disabled="query.page <= 0" @click="prevPage" />
        <view class="sub-title">第 {{ query.page + 1 }} / {{ totalPages }} 页（共 {{ totalElements }} 条）</view>
        <u-button size="small" text="下一页" :disabled="query.page + 1 >= totalPages" @click="nextPage" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { deleteCoach, listCoaches, type Coach } from '@/api/modules/coaches'
import { coachStatusOptions, findLabel, genderOptions } from '@/constants/enums'
import { getAuth, isLoggedIn } from '@/store/auth'
import { clearDraft, loadDraft, saveDraft } from '@/utils/draft'
import { showError, showSuccess } from '@/utils/error'

const QUERY_DRAFT_KEY = 'coaches.query'

const defaults = {
  page: 0,
  size: 10,
  name: '',
  status: ''
}

const query = reactive({
  ...defaults,
  ...loadDraft(QUERY_DRAFT_KEY, defaults)
})

const loading = ref(false)
const rows = ref<Coach[]>([])
const totalPages = ref(1)
const totalElements = ref(0)

const isAdmin = computed(() => getAuth()?.role === 'ADMIN')
const statusOptions = [{ label: '全部', value: '' }, ...coachStatusOptions]
const statusIndex = computed(() => statusOptions.findIndex(item => item.value === query.status))
const statusLabel = computed(() => statusOptions.find(item => item.value === query.status)?.label || '全部')

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
  return findLabel(coachStatusOptions, value)
}

function onStatusChange(event: any) {
  const idx = Number(event.detail.value)
  query.status = statusOptions[idx]?.value || ''
}

async function fetchData() {
  loading.value = true
  try {
    const data = await listCoaches({
      page: query.page,
      size: query.size,
      name: query.name.trim() || undefined,
      status: query.status || undefined
    })
    rows.value = data.content || []
    totalPages.value = data.totalPages || 1
    totalElements.value = data.totalElements || 0
  } catch (error) {
    showError(error, '教练列表获取失败')
  } finally {
    loading.value = false
  }
}

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
  if (query.page <= 0) return
  query.page -= 1
  fetchData()
}

function nextPage() {
  if (query.page + 1 >= totalPages.value) return
  query.page += 1
  fetchData()
}

function goCreate() {
  uni.navigateTo({ url: '/pages/admin/coaches/form?mode=create' })
}

function goEdit(id: number) {
  uni.navigateTo({ url: `/pages/admin/coaches/form?mode=edit&id=${id}` })
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/admin/coaches/detail?id=${id}` })
}

async function handleDelete(item: Coach) {
  const confirm = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '删除确认',
      content: `确认删除教练“${item.name}”吗？`,
      confirmText: '删除',
      cancelText: '取消',
      success: (res) => resolve(!!res.confirm),
      fail: () => resolve(false)
    })
  })

  if (!confirm) return

  try {
    await deleteCoach(item.id)
    showSuccess('教练删除成功')
    fetchData()
  } catch (error) {
    showError(error, '教练删除失败')
  }
}

watch(
  () => ({ ...query }),
  (value) => saveDraft(QUERY_DRAFT_KEY, value),
  { deep: true }
)

onLoad(() => {
  if (ensureLogin()) {
    fetchData()
  }
})

onShow(() => {
  if (ensureLogin()) {
    fetchData()
  }
})
</script>

<style scoped lang="scss">
.input,
.picker {
  background: #f9fafb;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  margin-top: 10rpx;
}
</style>
