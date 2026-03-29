<template>
  <view class="page">
    <view class="card">
      <view class="title">{{ isCreate ? '新增训练记录' : '编辑训练记录' }}</view>

      <view style="margin-top: 20rpx">
        <view class="required">学员</view>
        <picker :range="studentOptions" range-key="name" :value="studentIndex" @change="onStudentChange">
          <view class="picker">{{ studentLabel }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">课程</view>
        <picker :range="courseOptions" range-key="name" :value="courseIndex" @change="onCourseChange">
          <view class="picker">{{ courseLabel }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">训练日期</view>
        <picker mode="date" :value="form.trainingDate" @change="onDateChange">
          <view class="picker">{{ form.trainingDate || '请选择训练日期' }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">训练内容</view>
        <textarea class="textarea" v-model="form.trainingContent" maxlength="255" placeholder="请输入训练内容" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">时长（分钟）</view>
        <input class="input" v-model="form.durationMinutes" type="number" placeholder="请输入时长" />
      </view>

      <view style="margin-top: 20rpx">
        <view>强度等级</view>
        <picker :range="intensityOptions" range-key="label" :value="intensityIndex" @change="onIntensityChange">
          <view class="picker">{{ intensityLabel }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view>训练反馈</view>
        <textarea class="textarea" v-model="form.performanceSummary" maxlength="255" placeholder="请输入训练反馈" />
      </view>

      <view style="margin-top: 20rpx">
        <view>教练评语</view>
        <textarea class="textarea" v-model="form.coachComment" maxlength="255" placeholder="请输入教练评语" />
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
import { listCourses, type Course } from '@/api/modules/courses'
import { listStudents, type Student } from '@/api/modules/students'
import { createTrainingRecord, getTrainingRecord, updateTrainingRecord } from '@/api/modules/training'
import { isLoggedIn } from '@/store/auth'
import { clearDraft, loadDraft, saveDraft } from '@/utils/draft'
import { findLabel, trainingIntensityOptions } from '@/constants/enums'
import { showError, showSuccess } from '@/utils/error'
import { toPositiveInt, trimText } from '@/utils/validators'

const mode = ref<'create' | 'edit'>('create')
const recordId = ref(0)
const saving = ref(false)
const ready = ref(false)
const draftKey = ref('training.form.create.new')

const studentOptions = ref<Student[]>([])
const courseOptions = ref<Course[]>([])
const intensityOptions = [{ label: '未设置', value: '' }, ...trainingIntensityOptions]

const form = reactive({
  studentId: 0,
  courseId: 0,
  trainingDate: '',
  trainingContent: '',
  durationMinutes: '60',
  intensityLevel: '',
  performanceSummary: '',
  coachComment: ''
})

const isCreate = computed(() => mode.value === 'create')
const studentIndex = computed(() => studentOptions.value.findIndex(item => item.id === form.studentId))
const courseIndex = computed(() => courseOptions.value.findIndex(item => item.id === form.courseId))
const intensityIndex = computed(() => intensityOptions.findIndex(item => item.value === form.intensityLevel))
const studentLabel = computed(() => studentOptions.value[studentIndex.value]?.name || '请选择学员')
const courseLabel = computed(() => courseOptions.value[courseIndex.value]?.name || '请选择课程')
const intensityLabel = computed(() => findLabel(intensityOptions, form.intensityLevel))

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

async function loadOptions() {
  const [students, courses] = await Promise.all([
    listStudents({ page: 0, size: 200 }),
    listCourses({ page: 0, size: 200 })
  ])
  studentOptions.value = students.content
  courseOptions.value = courses.content
}

function assignForm(payload: Partial<typeof form>) {
  Object.assign(form, payload)
}

function buildDraftKey() {
  draftKey.value = `training.form.${mode.value}.${recordId.value || 'new'}`
}

function restoreDraft() {
  const draft = loadDraft(draftKey.value, null as Partial<typeof form> | null)
  if (draft) {
    assignForm(draft)
  }
}

function onStudentChange(event: any) {
  const index = Number(event.detail.value)
  form.studentId = studentOptions.value[index]?.id || 0
}

function onCourseChange(event: any) {
  const index = Number(event.detail.value)
  form.courseId = courseOptions.value[index]?.id || 0
}

function onDateChange(event: any) {
  form.trainingDate = event.detail.value
}

function onIntensityChange(event: any) {
  const index = Number(event.detail.value)
  form.intensityLevel = intensityOptions[index]?.value || ''
}

function validate(): string | null {
  if (!form.studentId) return '请选择学员'
  if (!form.courseId) return '请选择课程'
  if (!form.trainingDate) return '请选择训练日期'
  if (!trimText(form.trainingContent)) return '请填写训练内容'
  if (toPositiveInt(form.durationMinutes, 0) <= 0) return '请输入有效的训练时长'
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
    const payload = {
      studentId: form.studentId,
      courseId: form.courseId,
      trainingDate: form.trainingDate,
      trainingContent: trimText(form.trainingContent),
      durationMinutes: toPositiveInt(form.durationMinutes, 60),
      intensityLevel: trimText(form.intensityLevel),
      performanceSummary: trimText(form.performanceSummary),
      coachComment: trimText(form.coachComment)
    }

    if (isCreate.value) {
      await createTrainingRecord(payload)
      showSuccess('训练记录创建成功')
    } else {
      await updateTrainingRecord(recordId.value, payload)
      showSuccess('训练记录更新成功')
    }

    clearDraft(draftKey.value)
    setTimeout(() => uni.navigateBack(), 300)
  } catch (error) {
    showError(error, '保存训练记录失败')
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

  await loadOptions()
  mode.value = query?.mode === 'edit' ? 'edit' : 'create'
  recordId.value = Number(query?.id || 0)
  buildDraftKey()

  if (mode.value === 'edit' && recordId.value) {
    try {
      const data = await getTrainingRecord(recordId.value)
      assignForm({
        studentId: data.studentId,
        courseId: data.courseId,
        trainingDate: data.trainingDate,
        trainingContent: data.trainingContent,
        durationMinutes: String(data.durationMinutes),
        intensityLevel: data.intensityLevel || '',
        performanceSummary: data.performanceSummary || '',
        coachComment: data.coachComment || ''
      })
    } catch (error) {
      showError(error, '训练记录加载失败')
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
