<template>
  <view class="metric-grid">
    <view v-for="metric in metrics" :key="metric.key" class="metric-card" :class="metric.tone">
      <view class="metric-label">{{ metric.label }}</view>
      <view class="metric-value">{{ metric.value }}</view>
      <view class="metric-hint">{{ metric.hint }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ParentHomeMetric } from '@/types/parent-home'

defineProps<{
  metrics: ParentHomeMetric[]
}>()
</script>

<style scoped lang="scss">
.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
}

.metric-card {
  border-radius: 24rpx;
  padding: 24rpx 20rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.06);
}

.metric-card.teal {
  background: linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%);
}

.metric-card.blue {
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
}

.metric-card.amber {
  background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);
}

.metric-label {
  font-size: 24rpx;
  color: #64748b;
}

.metric-value {
  margin-top: 12rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #0f172a;
}

.metric-hint {
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.5;
  color: #475569;
}
</style>
