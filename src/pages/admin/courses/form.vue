<template>
  <view class="page">
    <view class="card">
      <view class="title">{{ isCreate ? '新增课程' : '编辑课程' }}</view>

      <view v-if="isCreate" style="margin-top: 20rpx">
        <view class="required">课程编码</view>
        <input class="input" v-model="form.courseCode" placeholder="请输入课程编码" maxlength="32" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">课程名称</view>
        <input class="input" v-model="form.name" placeholder="请输入课程名称" maxlength="100" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">课程类型</view>
        <input class="input" v-model="form.courseType" placeholder="请输入课程类型" maxlength="64" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">教练姓名</view>
        <input class="input" v-model="form.coachName" placeholder="请输入教练姓名" maxlength="64" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">场地</view>
        <input class="input" v-model="form.venue" placeholder="请输入场地" maxlength="128" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">开始日期</view>
        <picker mode="date" :value="form.startDate" @change="onStartDateChange">
          <view class="picker">{{ form.startDate || '请选择开始日期' }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">开始时间</view>
        <picker mode="time" :value="form.startClock" @change="onStartClockChange">
          <view class="picker">{{ form.startClock || '请选择开始时间' }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">时长（分钟）</view>
        <input class="input" v-model="form.durationMinutes" type="number" placeholder="请输入时长（分钟）" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">状态</view>
        <picker :range="statusOptions" range-key="label" :value="statusIndex" @change="onStatusChange">
          <view class="picker">{{ statusLabel }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view>描述</view>
        <textarea class="textarea" v-model="form.description" maxlength="255" placeholder="请输入描述" />
      </view>

      <view class="form-actions">
        <u-button text="取消" @click="handleCancel" />
        <u-button type="primary" :loading="saving" text="保存" @click="handleSubmit" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  createCourse,
  getCourse,
  updateCourse,
  type CourseCreatePayload,
  type CourseUpdatePayload
} from '@/api/modules/courses'
import { isLoggedIn } from '@/store/auth'
import { clearDraft, loadDraft, saveDraft } from '@/utils/draft'
import { showError, showSuccess } from '@/utils/error'
import { trimText, toPositiveInt } from '@/utils/validators'
import { courseStatusOptions } from '@/constants/enums'

const mode = ref<'create' | 'edit'>('create')
const courseId = ref(0)
const saving = ref(false)
const ready = ref(false)
const draftKey = ref('courses.form.create.new')

const form = reactive({
  courseCode: '',
  name: '',
  courseType: '',
  coachName: '',
  venue: '',
  startDate: '',
  startClock: '09:00',
  durationMinutes: '60',
  status: 'PLANNED' as 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED',
  description: ''
})

const isCreate = computed(() => mode.value === 'create')
const statusOptions = courseStatusOptions
const statusIndex = computed(() => statusOptions.findIndex(item => item.value === form.status))
const statusLabel = computed(() => statusOptions.find(item => item.value === form.status)?.label || '-')

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

function assignForm(payload: Partial<typeof form>) {
  Object.assign(form, payload)
}

function buildDraftKey() {
  draftKey.value = `courses.form.${mode.value}.${courseId.value || 'new'}`
}

function restoreDraft() {
  const draft = loadDraft(draftKey.value, null as Partial<typeof form> | null)
  if (draft) {
    assignForm(draft)
  }
}

function onStatusChange(event: any) {
  const index = Number(event.detail.value)
  form.status = statusOptions[index]?.value || 'PLANNED'
}

function onStartDateChange(event: any) {
  form.startDate = event.detail.value
}

function onStartClockChange(event: any) {
  form.startClock = event.detail.value
}

function parseStartTime(startTime: string) {
  if (!startTime) return
  const [date, timePart] = startTime.split('T')
  form.startDate = date || ''
  form.startClock = (timePart || '09:00:00').slice(0, 5)
}

function buildStartTime() {
  return `${form.startDate}T${form.startClock}:00`
}

function validate(): string | null {
  if (isCreate.value && !trimText(form.courseCode)) return '请填写课程编码'
  if (!trimText(form.name)) return '请填写课程名称'
  if (!trimText(form.courseType)) return '请填写课程类型'
  if (!trimText(form.coachName)) return '请填写教练姓名'
  if (!trimText(form.venue)) return '请填写场地'
  if (!form.startDate) return '请选择开始日期'
  if (!form.startClock) return '请选择开始时间'

  const duration = toPositiveInt(form.durationMinutes, 0)
  if (duration <= 0) return '课程时长必须大于0'

  return null
}

async function handleSubmit() {
  const errorText = validate()
  if (errorText) {
    uni.showToast({ title: errorText, icon: 'none' })
    return
  }

  saving.value = true
  try {
    const payload: CourseCreatePayload = {
      courseCode: trimText(form.courseCode),
      name: trimText(form.name),
      courseType: trimText(form.courseType),
      coachName: trimText(form.coachName),
      venue: trimText(form.venue),
      startTime: buildStartTime(),
      durationMinutes: toPositiveInt(form.durationMinutes, 60),
      status: form.status,
      description: trimText(form.description)
    }

    if (isCreate.value) {
      await createCourse(payload)
      showSuccess('课程创建成功')
    } else {
      const updatePayload: CourseUpdatePayload = {
        name: payload.name,
        courseType: payload.courseType,
        coachName: payload.coachName,
        venue: payload.venue,
        startTime: payload.startTime,
        durationMinutes: payload.durationMinutes,
        status: payload.status,
        description: payload.description
      }
      await updateCourse(courseId.value, updatePayload)
      showSuccess('课程更新成功')
    }

    clearDraft(draftKey.value)
    setTimeout(() => {
      uni.navigateBack()
    }, 300)
  } catch (error) {
    showError(error, '保存失败')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  clearDraft(draftKey.value)
  uni.navigateBack()
}

watch(
  form,
  (value) => {
    if (!ready.value) return
    saveDraft(draftKey.value, { ...value })
  },
  { deep: true }
)

onLoad(async (query) => {
  if (!ensureLogin()) return

  mode.value = query?.mode === 'edit' ? 'edit' : 'create'
  courseId.value = Number(query?.id || 0)
  buildDraftKey()

  if (mode.value === 'edit' && courseId.value) {
    try {
      const data = await getCourse(courseId.value)
      assignForm({
        courseCode: data.courseCode,
        name: data.name,
        courseType: data.courseType,
        coachName: data.coachName,
        venue: data.venue,
        durationMinutes: String(data.durationMinutes),
        status: data.status,
        description: data.description
      })
      parseStartTime(data.startTime)
    } catch (error) {
      showError(error, '加载课程信息失败')
    }
  }

  restoreDraft()
  ready.value = true
})
</script>

<style scoped lang="scss">
.input,
.picker,
.textarea {
  background: #f9fafb;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  margin-top: 10rpx;
}

.textarea {
  min-height: 160rpx;
}
</style>

