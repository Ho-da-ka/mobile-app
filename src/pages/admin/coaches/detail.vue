<template>
  <view class="page">
    <view class="card" v-if="loading">加载中...</view>

    <view class="card" v-else-if="coach">
      <view class="title">{{ coach.name }}</view>
      <view class="sub-title" style="margin-top: 10rpx">教练编号：{{ coach.coachCode }}</view>

      <view class="field"><text class="key">性别</text><text>{{ genderText(coach.gender) }}</text></view>
      <view class="field"><text class="key">手机号</text><text>{{ coach.phone || '-' }}</text></view>
      <view class="field"><text class="key">擅长方向</text><text>{{ coach.specialty || '-' }}</text></view>
      <view class="field"><text class="key">状态</text><text>{{ statusText(coach.status) }}</text></view>
      <view class="field"><text class="key">备注</text><text>{{ coach.remarks || '-' }}</text></view>

      <view class="form-actions">
        <u-button text="返回" @click="goBack" />
        <u-button v-if="isAdmin" type="primary" text="编辑" @click="goEdit" />
      </view>
    </view>

    <view class="card" v-else>未找到教练信息</view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCoach, type Coach } from '@/api/modules/coaches'
import { coachStatusOptions, findLabel, genderOptions } from '@/constants/enums'
import { getAuth, isLoggedIn } from '@/store/auth'
import { showError } from '@/utils/error'

const loading = ref(false)
const coach = ref<Coach | null>(null)
const coachId = ref(0)

const isAdmin = computed(() => getAuth()?.role === 'ADMIN')

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

async function fetchDetail() {
  if (!coachId.value) return
  loading.value = true
  try {
    coach.value = await getCoach(coachId.value)
  } catch (error) {
    showError(error, '获取教练详情失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

function goEdit() {
  if (!coachId.value) return
  uni.navigateTo({ url: `/pages/admin/coaches/form?mode=edit&id=${coachId.value}` })
}

onLoad((query) => {
  if (!ensureLogin()) return
  coachId.value = Number(query?.id || 0)
  if (!coachId.value) {
    uni.showToast({ title: '缺少教练ID', icon: 'none' })
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
