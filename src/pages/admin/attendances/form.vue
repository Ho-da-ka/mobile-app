<template>
  <view class="page">
    <view class="card">
      <view class="title">新增考勤</view>

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
        <view class="required">考勤日期</view>
        <picker mode="date" :value="form.attendanceDate" @change="onDateChange">
          <view class="picker">{{ form.attendanceDate || '请选择考勤日期' }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">考勤状态</view>
        <picker :range="statusOptions" range-key="label" :value="statusIndex" @change="onStatusChange">
          <view class="picker">{{ statusLabel }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view>备注</view>
        <textarea class="textarea" v-model="form.note" maxlength="255" placeholder="请输入备注" />
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
import { attendanceStatusOptions } from '@/constants/enums'
import { createAttendance } from '@/api/modules/attendance'
import { listCourses, type Course } from '@/api/modules/courses'
import { listStudents, type Student } from '@/api/modules/students'
import { isLoggedIn } from '@/store/auth'
import { clearDraft, loadDraft, saveDraft } from '@/utils/draft'
import { showError, showSuccess } from '@/utils/error'
import { trimText } from '@/utils/validators'

const DRAFT_KEY = 'attendances.form'
const saving = ref(false)
const studentOptions = ref<Array<Student>>([])
const courseOptions = ref<Array<Course>>([])

const form = reactive({
  studentId: 0,
  courseId: 0,
  attendanceDate: '',
  status: 'PRESENT' as 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE',
  note: '',
  ...loadDraft(DRAFT_KEY, {})
})

const statusOptions = attendanceStatusOptions
const studentIndex = computed(() => studentOptions.value.findIndex(item => item.id === form.studentId))
const courseIndex = computed(() => courseOptions.value.findIndex(item => item.id === form.courseId))
const statusIndex = computed(() => statusOptions.findIndex(item => item.value === form.status))
const studentLabel = computed(() => studentOptions.value[studentIndex.value]?.name || '请选择学员')
const courseLabel = computed(() => courseOptions.value[courseIndex.value]?.name || '请选择课程')
const statusLabel = computed(() => statusOptions[statusIndex.value]?.label || '请选择状态')

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

function onStudentChange(event: any) {
  const index = Number(event.detail.value)
  form.studentId = studentOptions.value[index]?.id || 0
}

function onCourseChange(event: any) {
  const index = Number(event.detail.value)
  form.courseId = courseOptions.value[index]?.id || 0
}

function onDateChange(event: any) {
  form.attendanceDate = event.detail.value
}

function onStatusChange(event: any) {
  const index = Number(event.detail.value)
  form.status = statusOptions[index]?.value || 'PRESENT'
}

async function handleSubmit() {
  if (!form.studentId || !form.courseId || !form.attendanceDate) {
    uni.showToast({ title: '请填写必填字段', icon: 'none' })
    return
  }

  saving.value = true
  try {
    await createAttendance({
      studentId: form.studentId,
      courseId: form.courseId,
      attendanceDate: form.attendanceDate,
      status: form.status,
      note: trimText(form.note)
    })
    clearDraft(DRAFT_KEY)
    showSuccess('考勤已保存')
    setTimeout(() => uni.navigateBack(), 300)
  } catch (error) {
    showError(error, '保存考勤失败')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  clearDraft(DRAFT_KEY)
  uni.navigateBack()
}

watch(
  form,
  (value) => saveDraft(DRAFT_KEY, { ...value }),
  { deep: true }
)

onLoad(async () => {
  if (!ensureLogin()) return
  await loadOptions()
})
</script>

<style scoped lang="scss">
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
