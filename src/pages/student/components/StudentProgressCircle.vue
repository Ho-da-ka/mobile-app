<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  percent?: number; // 0-100
  size?: number | string; // e.g., 160, '160rpx'
}

const props = withDefaults(defineProps<Props>(), {
  percent: 0,
  size: '120rpx'
});

const sizeStyle = computed(() => {
  const sizeVal = typeof props.size === 'number' ? `${props.size}rpx` : props.size;
  return {
    width: sizeVal,
    height: sizeVal
  };
});

// Robust CSS-based progress ring for Mini Programs
const progressStyle = computed(() => {
  const p = Math.min(Math.max(props.percent, 0), 100);
  return {
    background: `conic-gradient(#F97316 ${p * 3.6}deg, #F1F5F9 0deg)`
  };
});
</script>

<template>
  <view class="progress-container" :style="sizeStyle">
    <!-- Outer Ring (CSS Gradient) -->
    <view class="progress-ring" :style="progressStyle">
      <!-- Inner Circle (Mask) -->
      <view class="inner-circle">
        <view class="percent-text">
          <text class="number">{{ Math.round(percent) }}</text>
          <text class="unit">%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.progress-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: background 0.6s ease;
}

.inner-circle {
  width: 88%; // Control the thickness of the ring
  height: 88%;
  background-color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.percent-text {
  display: flex;
  align-items: baseline;
  color: #0F172A;
  font-weight: 800;

  .number {
    font-size: 32rpx;
  }

  .unit {
    font-size: 20rpx;
    margin-left: 2rpx;
  }
}
</style>
