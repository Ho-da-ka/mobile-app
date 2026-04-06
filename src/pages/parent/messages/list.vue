<template>
  <view class="page">
    <view class="card row between">
      <view class="title" style="font-size: 30rpx">站内消息</view>
      <u-button size="small" type="primary" text="刷新" @click="fetchMessages" />
    </view>

    <view v-if="loading" class="card">加载中...</view>
    <view v-else-if="messages.length === 0" class="card">暂无消息</view>
    <view v-else>
      <view v-for="msg in messages" :key="msg.id" class="card">
        <view class="row between">
          <view class="name">{{ msg.title }}</view>
          <view class="read-tag" :class="msg.read ? 'read' : 'unread'">{{ msg.read ? '已读' : '未读' }}</view>
        </view>
        <view class="sub-title" style="margin-top: 8rpx">类型：{{ msg.msgType }}</view>
        <view class="content">{{ msg.content }}</view>
        <view class="sub-title">时间：{{ formatDateTime(msg.createdAt) }}</view>
        <view class="form-actions" v-if="!msg.read">
          <u-button size="small" type="primary" text="标记已读" @click="handleRead(msg.id)" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { listParentMessages, readParentMessage, type ParentMessage } from '@/api/modules/parent'
import { isLoggedIn } from '@/store/auth'
import { showError, showSuccess } from '@/utils/error'

const loading = ref(false)
const messages = ref<ParentMessage[]>([])

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

async function fetchMessages() {
  if (!ensureLogin()) return
  loading.value = true
  try {
    messages.value = await listParentMessages()
  } catch (error) {
    showError(error, '消息获取失败')
  } finally {
    loading.value = false
  }
}

async function handleRead(id: number) {
  try {
    await readParentMessage(id)
    showSuccess('已标记已读')
    fetchMessages()
  } catch (error) {
    showError(error, '操作失败')
  }
}

onLoad(fetchMessages)
onShow(fetchMessages)
</script>

<style scoped lang="scss">
.name {
  font-size: 30rpx;
  font-weight: 700;
}

.content {
  margin-top: 10rpx;
  margin-bottom: 10rpx;
  font-size: 27rpx;
  color: #1f2937;
  line-height: 1.5;
}

.read-tag {
  font-size: 24rpx;
  border-radius: 999rpx;
  padding: 8rpx 14rpx;
}

.read {
  background: #f3f4f6;
  color: #6b7280;
}

.unread {
  background: #fee2e2;
  color: #b91c1c;
}
</style>

