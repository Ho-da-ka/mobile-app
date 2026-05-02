<script setup lang="ts">
interface Props {
  title: string;
  icon: string;
  color?: string;
}

defineProps<Props>();
const emit = defineEmits(['click']);
</script>

<template>
  <view class="feature-tile" @click="emit('click')">
    <view class="icon-wrapper" :style="{ backgroundColor: color + '10' }">
      <up-icon :name="icon" size="48rpx" :color="color || '#F97316'" />
    </view>
    <view class="title">{{ title }}</view>
  </view>
</template>

<style lang="scss" scoped>
.feature-tile {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(15, 23, 42, 0.03);
  flex: 1;

  .icon-wrapper {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16rpx;
  }

  .title {
    font-size: 26rpx;
    color: #0F172A;
    font-weight: 500;
  }
}
</style>
