<template>
  <scroll-view class="date-slider" scroll-x :scroll-into-view="scrollIntoId" scroll-with-animation>
    <view class="date-list">
      <view
        v-for="(item, index) in dateList"
        :key="item.date"
        :id="'date-' + index"
        class="date-item"
        :class="{ active: item.date === modelValue }"
        @click="selectDate(item.date)"
      >
        <text class="week">{{ item.week }}</text>
        <text class="day">{{ item.day }}</text>
        <view class="dot" :class="{ 'has-event': item.hasEvent }"></view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  modelValue: string // YYYY-MM-DD
  events?: string[] // 有事件的日期数组 ['2026-04-18']
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const dateList = ref<Array<{ date: string; day: string; week: string; hasEvent: boolean }>>([])
const scrollIntoId = ref('')

const weekMap = ['日', '一', '二', '三', '四', '五', '六']

function generateDates() {
  const list = []
  const today = new Date()
  // 生成前后各7天
  for (let i = -7; i <= 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    list.push({
      date: dateStr,
      day: day,
      week: weekMap[d.getDay()],
      hasEvent: props.events?.includes(dateStr) ?? false
    })
  }
  dateList.value = list
  
  // 滚动到选中的日期
  const activeIndex = list.findIndex(item => item.date === props.modelValue)
  if (activeIndex > -1) {
    const targetIndex = Math.max(0, activeIndex - 2)
    scrollIntoId.value = 'date-' + targetIndex
  }
}

watch(() => props.events, () => {
  generateDates()
}, { deep: true })

function selectDate(date: string) {
  emit('update:modelValue', date)
  emit('change', date)
}

onMounted(() => {
  generateDates()
})
</script>

<style scoped lang="scss">
.date-slider {
  width: 100%;
  white-space: nowrap;
  background-color: #ffffff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f3f4f6;
}
.date-list {
  display: inline-flex;
  padding: 0 20rpx;
}
.date-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90rpx;
  height: 110rpx;
  margin: 0 10rpx;
  border-radius: 16rpx;
  background-color: #f8fafc;
  transition: all 0.2s;

  &.active {
    background-color: #3b82f6;
    color: #ffffff;
    
    .week, .day { color: #ffffff; }
  }

  .week {
    font-size: 24rpx;
    color: #6b7280;
    margin-bottom: 8rpx;
  }
  .day {
    font-size: 32rpx;
    font-weight: bold;
    color: #111827;
  }
  .dot {
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    margin-top: 6rpx;
    background-color: transparent;
    
    &.has-event {
      background-color: #ef4444;
    }
  }
  
  &.active .dot.has-event {
    background-color: #ffffff;
  }
}
</style>