<template>
  <view class="admin-menu-tile" @click="$emit('click')">
    <view class="icon-wrapper">
      <u-icon :name="icon" color="#3B82F6" size="48rpx"></u-icon>
    </view>
    <view class="content">
      <view class="title">{{ title }}</view>
      <view class="subtitle">{{ subtitle }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  icon: string
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped lang="scss">
.admin-menu-tile {
  background-color: #ffffff;
  padding: 32rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: all 0.2s ease;

  &:active {
    opacity: 0.7;
    transform: scale(0.98);
  }

  .icon-wrapper {
    margin-bottom: 24rpx;
  }

  .content {
    .title {
      font-size: 30rpx;
      font-weight: bold;
      color: #0F172A;
      margin-bottom: 8rpx;
    }

    .subtitle {
      font-size: 22rpx;
      color: #94A3B8;
      line-height: 1.4;
    }
  }
}
</style>
