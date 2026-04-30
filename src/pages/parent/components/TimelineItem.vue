<script setup lang="ts">
import type { ParentHomeTimelineItem } from '@/types/parent-home';
import { computed } from 'vue';

const props = defineProps<{
  item: ParentHomeTimelineItem;
}>();

const statusClass = computed(() => ({
  'is-past': props.item.status === 'past',
  'is-upcoming': props.item.status === 'upcoming',
  'is-ongoing': props.item.status === 'ongoing',
}));

const handleReportClick = () => {
  if (props.item.reportUrl) {
    uni.navigateTo({
      url: props.item.reportUrl
    });
  }
};
</script>

<template>
  <view class="timeline-item" :class="statusClass">
    <!-- Left Column: Time -->
    <view class="time-column">
      <text class="time-text">{{ item.time }}</text>
    </view>

    <!-- Middle Column: Node & Line -->
    <view class="node-column">
      <view class="vertical-line"></view>
      <view class="status-node"></view>
    </view>

    <!-- Right Column: Content Card -->
    <view class="content-column">
      <view class="content-card">
        <text class="item-title">{{ item.title }}</text>
        <view class="item-meta">
          <text class="meta-text coach-name">{{ item.coach }}</text>
          <text class="meta-divider">|</text>
          <text class="meta-text location-name">{{ item.location }}</text>
        </view>
        
        <view v-if="item.reportUrl" class="report-link-wrapper">
          <text 
            class="report-link"
            @tap.stop="handleReportClick"
          >
            查看课后反馈报告 →
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.timeline-item {
  display: flex;
  min-height: 160rpx;
}

/* Time Column */
.time-column {
  width: 100rpx;
  padding-top: 36rpx;
  text-align: right;
  flex-shrink: 0;
}

.time-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #64748B;
}

/* Node Column */
.node-column {
  width: 80rpx;
  position: relative;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.vertical-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2rpx;
  background-color: #E2E8F0;
}

.status-node {
  position: relative;
  z-index: 1;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background-color: #FFFFFF;
  margin-top: 44rpx; /* Aligns with middle of first title line */
  box-sizing: border-box;
}

/* Content Column */
.content-column {
  flex: 1;
  padding-bottom: 48rpx;
}

.content-card {
  background-color: #FFFFFF;
  padding: 32rpx;
  border-radius: 16rpx;
  transition: all 0.2s ease;
}

.item-title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #1E293B;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: 26rpx;
  color: #64748B;
}

.meta-divider {
  color: #CBD5E1;
}

.report-link-wrapper {
  text-align: right;
  margin-top: 24rpx;
}

.report-link {
  font-size: 26rpx;
  font-weight: 500;
  color: #2563EB;
}

/* Status Variations */

/* Past Status */
.is-past {
  .time-text {
    color: #94A3B8;
  }

  .status-node {
    border: 4rpx solid #E2E8F0;
  }

  .content-card {
    background-color: #F8FAFC;
  }

  .item-title {
    color: #64748B;
  }

  .item-meta {
    color: #94A3B8;
  }
}

/* Upcoming / Ongoing Status */
.is-upcoming,
.is-ongoing {
  .status-node {
    background-color: #2563EB;
    border: 4rpx solid #2563EB;
  }
}

.is-ongoing {
  .item-title {
    color: #2563EB;
  }
}

/* Specific adjustment for the first and last item's line is usually better handled 
   by the parent component by passing a prop or using CSS if used in a list. 
   Here we provide some default behavior. */
:first-child .vertical-line {
  top: 44rpx;
}

:last-child .vertical-line {
  bottom: auto;
  height: 44rpx;
}
</style>

