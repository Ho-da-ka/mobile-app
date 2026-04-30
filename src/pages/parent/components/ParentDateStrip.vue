<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  selectedDate: string; // YYYY-MM-DD
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'select', date: string): void;
}>();

// Generate dates: 7 days before today to 7 days after today
const dates = computed(() => {
  const list = [];
  const today = new Date();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  
  for (let i = -7; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    list.push({
      date: dateStr,
      day: date.getDate(),
      weekDay: weekDays[date.getDay()],
      isToday: i === 0
    });
  }
  return list;
});

const onSelect = (date: string) => {
  emit('select', date);
};
</script>

<template>
  <scroll-view class="date-strip-scroll" scroll-x :show-scrollbar="false">
    <div class="date-strip-container">
      <div 
        v-for="item in dates" 
        :key="item.date"
        class="date-item"
        :class="{ 'is-selected': item.date === selectedDate }"
        @tap="onSelect(item.date)"
      >
        <span class="weekday">{{ item.weekDay }}</span>
        <span class="day">{{ item.day }}</span>
        <div class="underline" v-if="item.date === selectedDate"></div>
      </div>
    </div>
  </scroll-view>
</template>

<style lang="scss" scoped>
.date-strip-scroll {
  width: 100%;
  background-color: #ffffff;
  white-space: nowrap;
}

.date-strip-container {
  display: flex;
  padding: 20rpx 10rpx;
}

.date-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90rpx;
  position: relative;
  padding: 10rpx 0;
  
  .weekday {
    font-size: 24rpx;
    color: #6B7280;
    margin-bottom: 8rpx;
  }
  
  .day {
    font-size: 32rpx;
    color: #111827;
    font-weight: 500;
  }
  
  &.is-selected {
    .weekday {
      color: #2563EB;
      font-weight: 600;
    }
    .day {
      color: #2563EB;
      font-weight: 700;
    }
  }
}

.underline {
  position: absolute;
  bottom: 0;
  width: 40rpx;
  height: 4rpx;
  background-color: #2563EB;
  border-radius: 2rpx;
}
</style>
