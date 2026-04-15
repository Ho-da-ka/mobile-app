<template>
  <view class="page parent-home">
    <view v-if="loading" class="state-card">首页数据加载中...</view>
    <view v-else-if="errorText" class="state-card">
      <view class="state-title">首页加载失败</view>
      <view class="state-copy">{{ errorText }}</view>
      <u-button type="primary" text="重新加载" @click="loadHome" />
    </view>
    <view v-else-if="dashboard.emptyState" class="state-card">
      <view class="state-title">{{ dashboard.emptyState.title }}</view>
      <view class="state-copy">{{ dashboard.emptyState.description }}</view>
      <u-button type="primary" :text="dashboard.emptyState.ctaLabel" @click="navigate(dashboard.emptyState.ctaUrl)" />
    </view>
    <template v-else>
      <ParentHomeHero
        :hero="dashboard.hero"
        :children="children"
        :current-student-id="currentStudentId"
        @select-child="handleSelectChild"
      />

      <ParentHomeMetricGrid class="section-gap" :metrics="dashboard.metrics" />

      <ParentHomeActionSection
        class="section-gap"
        :primary-actions="dashboard.primaryActions"
        :secondary-actions="dashboard.secondaryActions"
        @navigate="navigate"
      />

      <ParentHomeActivityCard
        class="section-gap"
        :title="dashboard.latestUpdate.title"
        :summary="dashboard.latestUpdate.summary"
        :caption="dashboard.latestUpdate.caption"
        :cta-label="dashboard.latestUpdate.ctaLabel"
        :cta-url="dashboard.latestUpdate.ctaUrl"
        @navigate="navigate"
      />

      <ParentHomeActivityCard
        class="section-gap"
        :title="dashboard.todo.title"
        :summary="dashboard.todo.summary"
        :caption="dashboard.todo.caption"
        :cta-label="dashboard.todo.ctaLabel"
        :cta-url="dashboard.todo.ctaUrl"
        @navigate="navigate"
      />

      <view class="section-gap footer-actions">
        <u-button type="primary" text="刷新首页" @click="loadHome" />
        <u-button text="退出登录" @click="handleLogout" />
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { logout } from '@/api/modules/auth'
import {
  getParentGrowthOverview,
  listParentBookings,
  listParentChildren,
  listParentCourses,
  listParentFitness,
  listParentMessages,
  type ParentBooking,
  type ParentChild,
  type ParentCourse,
  type ParentMessage
} from '@/api/modules/parent'
import ParentHomeActionSection from './components/ParentHomeActionSection.vue'
import ParentHomeActivityCard from './components/ParentHomeActivityCard.vue'
import ParentHomeHero from './components/ParentHomeHero.vue'
import ParentHomeMetricGrid from './components/ParentHomeMetricGrid.vue'
import { getAuth, isLoggedIn } from '@/store/auth'
import type { FitnessTestRecord, ParentGrowthOverview } from '@/types/parent'
import {
  buildParentHomeDashboard,
  readStoredParentHomeStudentId,
  resolveCurrentParentStudentId,
  writeStoredParentHomeStudentId
} from '@/utils/parent-home'
import { showError, showSuccess } from '@/utils/error'

const loading = ref(false)
const errorText = ref('')
const children = ref<ParentChild[]>([])
const currentStudentId = ref<number | null>(null)
const messages = ref<ParentMessage[]>([])
const bookings = ref<ParentBooking[]>([])
const courses = ref<ParentCourse[]>([])
const fitnessRecords = ref<FitnessTestRecord[]>([])
const overview = ref<ParentGrowthOverview | null>(null)

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

const currentChild = computed(() => children.value.find((item) => item.id === currentStudentId.value) || null)

const dashboard = computed(() =>
  buildParentHomeDashboard({
    child: currentChild.value,
    overview: overview.value,
    messages: messages.value,
    bookings: bookings.value,
    courses: courses.value,
    fitnessRecords: fitnessRecords.value
  })
)

async function loadHome(preferredStudentId?: number | null) {
  if (!ensureLogin()) return

  loading.value = true
  errorText.value = ''

  try {
    const childList = await listParentChildren()
    children.value = childList

    const resolvedId = resolveCurrentParentStudentId(childList, preferredStudentId ?? readStoredParentHomeStudentId())
    currentStudentId.value = resolvedId

    if (resolvedId) {
      writeStoredParentHomeStudentId(resolvedId)
    }

    const [messageRows, bookingRows, courseRows, fitnessRows, growth] = await Promise.all([
      listParentMessages(),
      listParentBookings(),
      listParentCourses(),
      resolvedId ? listParentFitness(resolvedId) : Promise.resolve([]),
      resolvedId ? getParentGrowthOverview(resolvedId) : Promise.resolve(null)
    ])

    messages.value = messageRows
    bookings.value = bookingRows
    courses.value = courseRows
    fitnessRecords.value = fitnessRows
    overview.value = growth
  } catch (error) {
    errorText.value = '请检查网络后重试，首页其他功能稍后仍可从菜单进入。'
    showError(error, '家长首页加载失败')
  } finally {
    loading.value = false
  }
}

function navigate(url: string) {
  uni.navigateTo({ url })
}

function handleSelectChild(studentId: number) {
  if (studentId === currentStudentId.value) return
  loadHome(studentId)
}

async function handleLogout() {
  try {
    await logout(getAuth()?.refreshToken)
    showSuccess('已退出登录')
  } catch (error) {
    showError(error, '退出登录失败')
  } finally {
    uni.reLaunch({ url: '/pages/login/index' })
  }
}

onLoad(() => {
  loadHome()
})

onShow(() => {
  if (ensureLogin()) {
    loadHome(currentStudentId.value)
  }
})
</script>

<style scoped lang="scss">
.parent-home {
  min-height: 100vh;
  padding: 24rpx 24rpx 40rpx;
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 32%),
    linear-gradient(180deg, #f4fbf8 0%, #f5f7fb 42%, #eef4ff 100%);
}

.section-gap {
  margin-top: 20rpx;
}

.state-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.06);
}

.state-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #0f172a;
}

.state-copy {
  margin: 12rpx 0 24rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #64748b;
}

.footer-actions {
  display: flex;
  gap: 16rpx;
}
</style>
