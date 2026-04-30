<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  percent?: number; // 0-100
  size?: number | string; // e.g., 120, '120rpx'
}

const props = withDefaults(defineProps<Props>(), {
  percent: 0,
  size: '120rpx'
});

// Convert size to a number for internal calculations if it's a string like '120rpx'
// In uni-app, we usually treat size as rpx unless otherwise specified.
const sizeStyle = computed(() => {
  const sizeVal = typeof props.size === 'number' ? `${props.size}rpx` : props.size;
  return {
    width: sizeVal,
    height: sizeVal
  };
});

// SVG dimensions based on a base scale for simplicity, then scaled by size prop
const radius = 45;
const circumference = 2 * Math.PI * radius;
const dashOffset = computed(() => {
  const p = Math.min(Math.max(props.percent, 0), 100);
  return circumference - (p / 100) * circumference;
});
</script>

<template>
  <view class="progress-circle" :style="sizeStyle">
    <svg class="progress-svg" viewBox="0 0 100 100">
      <!-- Background Circle -->
      <circle
        class="bg-circle"
        cx="50"
        cy="50"
        :r="radius"
        stroke="#F1F5F9"
        stroke-width="4"
        fill="none"
      />
      <!-- Progress Circle -->
      <circle
        class="fg-circle"
        cx="50"
        cy="50"
        :r="radius"
        stroke="#F97316"
        stroke-width="4"
        stroke-linecap="round"
        fill="none"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90 50 50)"
      />
    </svg>
    <view class="percent-text">
      <text class="number">{{ Math.round(percent) }}</text>
      <text class="unit">%</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.progress-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .progress-svg {
    width: 100%;
    height: 100%;
  }

  .fg-circle {
    transition: stroke-dashoffset 0.6s ease;
  }

  .percent-text {
    position: absolute;
    display: flex;
    align-items: baseline;
    color: #0F172A;
    font-weight: bold;

    .number {
      font-size: 32rpx;
    }

    .unit {
      font-size: 20rpx;
      margin-left: 2rpx;
    }
  }
}
</style>
