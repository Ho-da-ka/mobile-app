<script setup lang="ts">
import StudentProgressCircle from './StudentProgressCircle.vue';

interface Props {
  progress: number;
  todayCourse: {
    id?: number;
    name: string;
    time: string;
    location: string;
    status: 'none' | 'upcoming' | 'ongoing' | 'completed';
    ctaLabel: string;
  };
}

const props = defineProps<Props>();
const emit = defineEmits(['action']);

function handleAction() {
  emit('action', props.todayCourse);
}
</script>

<template>
  <view class="action-hub">
    <view class="hub-content">
      <view class="left">
        <StudentProgressCircle :percent="progress" size="160rpx" />
        <view class="progress-label">本月进度</view>
      </view>
      <view class="right">
        <view class="course-status" :class="todayCourse.status">
          {{ todayCourse.status === 'none' ? '今日安排' : '今日课程' }}
        </view>
        <view class="course-name">{{ todayCourse.name }}</view>
        <view class="course-info">
          <view class="info-item">
            <up-icon name="clock" size="24rpx" color="#64748B" />
            <text>{{ todayCourse.time }}</text>
          </view>
          <view class="info-item">
            <up-icon name="map-fill" size="24rpx" color="#64748B" />
            <text>{{ todayCourse.location }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="hub-footer">
      <up-button
        :text="todayCourse.ctaLabel"
        type="primary"
        shape="circle"
        @click="handleAction"
        :customStyle="{ height: '90rpx', fontWeight: '700' }"
      ></up-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.action-hub {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.05);
  margin-bottom: 32rpx;

  .hub-content {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;

    .left {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 48rpx;

      .progress-label {
        margin-top: 12rpx;
        font-size: 22rpx;
        color: #64748B;
      }
    }

    .right {
      flex: 1;

      .course-status {
        font-size: 24rpx;
        color: #F97316;
        font-weight: 600;
        margin-bottom: 8rpx;
        
        &.completed {
          color: #22C55E;
        }
      }

      .course-name {
        font-size: 36rpx;
        color: #0F172A;
        font-weight: 700;
        margin-bottom: 16rpx;
      }

      .course-info {
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        .info-item {
          display: flex;
          align-items: center;
          gap: 8rpx;
          font-size: 24rpx;
          color: #64748B;
        }
      }
    }
  }

  .hub-footer {
    .cta-button {
      width: 100%;
      height: 96rpx;
      background: linear-gradient(90deg, #F97316 0%, #FB923C 100%);
      border-radius: 48rpx;
      color: #FFFFFF;
      font-size: 32rpx;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      
      &::after {
        border: none;
      }
    }
  }
}
</style>
