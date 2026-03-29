<template>
  <view class="page">
    <view class="card">
      <view class="title">家长端首页</view>
      <view class="sub-title" style="margin-top: 8rpx">管理孩子、预约课程、查看签到与消息。</view>

      <view class="form-actions">
        <u-button type="primary" text="我的孩子" @click="goChildren" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button type="success" text="可约课程" @click="goCourses" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button text="预约记录" @click="goBookings" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button text="签到记录" @click="goCheckins" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button text="体测结果" @click="goFitness" />
      </view>
      <view class="form-actions" style="margin-top: 10rpx">
        <u-button text="站内消息" @click="goMessages" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
function goChildren() {
  uni.navigateTo({ url: '/pages/parent/children/list' })
}

function goCourses() {
  uni.navigateTo({ url: '/pages/parent/courses/list' })
}

function goBookings() {
  uni.navigateTo({ url: '/pages/parent/bookings/list' })
}

function goCheckins() {
  uni.navigateTo({ url: '/pages/parent/checkin/list' })
}

function goFitness() {
  uni.navigateTo({ url: '/pages/parent/fitness/list' })
}

function goMessages() {
  uni.navigateTo({ url: '/pages/parent/messages/list' })
}
</script>