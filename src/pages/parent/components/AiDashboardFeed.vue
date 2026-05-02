<template>
  <view v-if="overview" class="ai-feed-card" @tap="handleExpand">
    <view class="ai-header">
      <view class="ai-badge">
        <u-icon name="magic-stick" color="#FFFFFF" size="24rpx"></u-icon>
        <text class="badge-text">AI 智能简报</text>
      </view>
      <text class="ai-time">刚刚更新</text>
    </view>
    
    <view class="ai-body">
      <view class="ai-summary">
        <text class="typing-text">{{ displayedText }}</text>
        <view v-if="isTyping" class="cursor">|</view>
      </view>
      
      <view class="ai-tags">
        <view class="ai-tag">本周进步：爆发力 +5%</view>
      </view>
    </view>
    
    <view class="ai-footer">
      <text class="footer-link">点击查看完整成长解析 →</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { ParentGrowthOverview } from '@/types/parent'

const props = defineProps<{
  overview: ParentGrowthOverview | null
}>()

const emit = defineEmits(['expand'])

const displayedText = ref('')
const isTyping = ref(false)

function startTyping() {
  if (!props.overview?.latestEvaluation?.aiInterpretation) return
  
  const fullText = props.overview.latestEvaluation.aiInterpretation
  displayedText.value = ''
  isTyping.value = true
  
  let i = 0
  const interval = setInterval(() => {
    if (i < fullText.length) {
      displayedText.value += fullText[i]
      i++
    } else {
      clearInterval(interval)
      isTyping.value = false
    }
  }, 50)
}

function handleExpand() {
  emit('expand')
}

onMounted(() => {
  if (props.overview) startTyping()
})

watch(() => props.overview, (newVal) => {
  if (newVal) startTyping()
}, { deep: true })
</script>

<style scoped lang="scss">
.ai-feed-card {
  margin: 30rpx 24rpx;
  background: linear-gradient(135deg, #EFF6FF 0%, #FAF5FF 100%);
  border: 1rpx solid #DBEAFE;
  border-radius: 24rpx;
  padding: 30rpx;
  position: relative;
  overflow: hidden;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.ai-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: linear-gradient(90deg, #3B82F6, #A855F7);
  padding: 6rpx 16rpx;
  border-radius: 10rpx;
  
  .badge-text {
    font-size: 20rpx;
    font-weight: 700;
    color: #FFFFFF;
  }
}

.ai-time {
  font-size: 20rpx;
  color: #94A3B8;
}

.ai-body {
  margin-bottom: 20rpx;
}

.ai-summary {
  font-size: 28rpx;
  color: #1E293B;
  line-height: 1.6;
  min-height: 80rpx;
  display: flex;
}

.cursor {
  color: #3B82F6;
  font-weight: bold;
  animation: blink 0.8s infinite;
  margin-left: 4rpx;
}

@keyframes blink {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ai-tags {
  display: flex;
  margin-top: 16rpx;
}

.ai-tag {
  background-color: rgba(59, 130, 246, 0.1);
  color: #2563EB;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-weight: 600;
}

.ai-footer {
  text-align: right;
  .footer-link {
    font-size: 22rpx;
    color: #3B82F6;
    font-weight: 600;
  }
}
</style>
