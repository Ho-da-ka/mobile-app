<template>
  <view class="admin-stat-tile">
    <view class="stat-value">{{ value }}</view>
    <view class="stat-label">{{ label }}</view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
}>()
</script>

<style scoped lang="scss">
.admin-stat-tile {
  background-color: #ffffff;
  border: 1rpx solid #e2e8f0;
  padding: 30rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .stat-value {
    font-size: 44rpx;
    font-weight: bold;
    color: #0f172a;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 24rpx;
    color: #64748b;
    margin-top: 8rpx;
  }
}
</style>
