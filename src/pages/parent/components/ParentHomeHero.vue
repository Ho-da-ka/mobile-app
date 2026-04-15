<template>
  <view class="hero-card">
    <view class="hero-row">
      <view>
        <view class="hero-label">{{ hero.label }}</view>
        <view class="hero-title">{{ hero.title }}</view>
        <view class="hero-status">{{ hero.status }}</view>
        <view class="hero-meta">{{ hero.meta }}</view>
      </view>
      <view class="hero-badge">{{ hero.unreadCount }} 条提醒</view>
    </view>

    <scroll-view v-if="children.length > 1" scroll-x class="chip-scroll">
      <view class="chip-row">
        <view
          v-for="child in children"
          :key="child.id"
          class="child-chip"
          :class="{ active: child.id === currentStudentId }"
          @click="$emit('select-child', child.id)"
        >
          {{ child.name }}
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import type { ParentChild } from '@/api/modules/parent'
import type { ParentHomeHero } from '@/types/parent-home'

defineProps<{
  hero: ParentHomeHero
  children: ParentChild[]
  currentStudentId: number | null
}>()

defineEmits<{
  (event: 'select-child', studentId: number): void
}>()
</script>

<style scoped lang="scss">
.hero-card {
  background: linear-gradient(135deg, #0f766e 0%, #1d4ed8 100%);
  border-radius: 28rpx;
  padding: 30rpx;
  color: #ffffff;
  box-shadow: 0 20rpx 48rpx rgba(15, 118, 110, 0.22);
}

.hero-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
}

.hero-label {
  font-size: 22rpx;
  opacity: 0.85;
}

.hero-title {
  margin-top: 8rpx;
  font-size: 40rpx;
  font-weight: 700;
}

.hero-status,
.hero-meta {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  opacity: 0.92;
}

.hero-badge {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.18);
  font-size: 22rpx;
  white-space: nowrap;
}

.chip-scroll {
  margin-top: 22rpx;
  white-space: nowrap;
}

.chip-row {
  display: inline-flex;
  gap: 12rpx;
}

.child-chip {
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.18);
  font-size: 24rpx;
}

.child-chip.active {
  background: #ffffff;
  color: #0f766e;
  font-weight: 700;
}
</style>
