<template>
  <view class="activity-card">
    <view class="activity-title">{{ title }}</view>
    <view class="activity-summary">{{ summary }}</view>
    <view class="activity-caption">{{ caption }}</view>
    <u-button size="small" type="primary" :text="ctaLabel" @click="$emit('navigate', ctaUrl)" />
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  summary: string
  caption: string
  ctaLabel: string
  ctaUrl: string
}>()

defineEmits<{
  (event: 'navigate', url: string): void
}>()
</script>

<style scoped lang="scss">
.activity-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.06);
}

.activity-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.activity-summary {
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #1f2937;
}

.activity-caption {
  margin: 14rpx 0 20rpx;
  font-size: 22rpx;
  color: #64748b;
}
</style>
