<template>
  <view class="section-card">
    <view class="section-title">常用功能</view>

    <view class="primary-grid">
      <view v-for="item in primaryActions" :key="item.key" class="action-card primary" @click="$emit('navigate', item.url)">
        <view class="action-name">{{ item.label }}</view>
        <view class="action-hint">{{ item.hint }}</view>
      </view>
    </view>

    <view class="secondary-grid">
      <view v-for="item in secondaryActions" :key="item.key" class="action-card secondary" @click="$emit('navigate', item.url)">
        <view class="action-row">
          <view class="action-name">{{ item.label }}</view>
          <view v-if="item.badge" class="action-badge">{{ item.badge }}</view>
        </view>
        <view class="action-hint">{{ item.hint }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ParentHomeAction } from '@/types/parent-home'

defineProps<{
  primaryActions: ParentHomeAction[]
  secondaryActions: ParentHomeAction[]
}>()

defineEmits<{
  (event: 'navigate', url: string): void
}>()
</script>

<style scoped lang="scss">
.section-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.06);
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.primary-grid,
.secondary-grid {
  display: grid;
  gap: 16rpx;
}

.primary-grid {
  margin-top: 20rpx;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.secondary-grid {
  margin-top: 16rpx;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.action-card {
  border-radius: 20rpx;
  padding: 22rpx 20rpx;
}

.action-card.primary {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border: 1rpx solid #dbeafe;
}

.action-card.secondary {
  background: #f8fafc;
}

.action-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #0f172a;
}

.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.action-badge {
  min-width: 36rpx;
  padding: 4rpx 10rpx;
  border-radius: 999rpx;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 20rpx;
  text-align: center;
}

.action-hint {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.5;
  color: #64748b;
}
</style>
