<template>
  <view class="page">
    <view class="card">
      <view class="title">新增体测</view>

      <view style="margin-top: 20rpx">
        <view class="required">学员</view>
        <picker :range="studentOptions" range-key="name" :value="studentIndex" @change="onStudentChange">
          <view class="picker">{{ studentLabel }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">体测日期</view>
        <picker mode="date" :value="form.testDate" @change="onDateChange">
          <view class="picker">{{ form.testDate || '请选择体测日期' }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">项目名称</view>
        <input class="input" v-model="form.itemName" placeholder="请输入项目名称" maxlength="100" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">结果数值</view>
        <input class="input" v-model="form.testValue" type="digit" placeholder="请输入结果数值" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">单位</view>
        <input class="input" v-model="form.unit" placeholder="例如 s、cm、次" maxlength="32" />
      </view>

      <view style="margin-top: 20rpx">
        <view>评语</view>
        <textarea class="textarea" v-model="form.comment" maxlength="255" placeholder="请输入评语" />
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
import { createFitnessTest } from '@/api/modules/fitness'
import { listStudents, type Student } from '@/api/modules/students'
import { isLoggedIn } from '@/store/auth'
import { clearDraft, loadDraft, saveDraft } from '@/utils/draft'
import { showError, showSuccess } from '@/utils/error'
import { trimText } from '@/utils/validators'

const DRAFT_KEY = 'fitness.form'
const saving = ref(false)
const studentOptions = ref<Student[]>([])

const form = reactive({
  studentId: 0,
  testDate: '',
  itemName: '',
  testValue: '',
  unit: 's',
  comment: '',
  ...loadDraft(DRAFT_KEY, {})
})

const studentIndex = computed(() => studentOptions.value.findIndex(item => item.id === form.studentId))
const studentLabel = computed(() => studentOptions.value[studentIndex.value]?.name || '请选择学员')

function ensureLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

async function loadOptions() {
  const students = await listStudents({ page: 0, size: 200 })
  studentOptions.value = students.content
}

function onStudentChange(event: any) {
  const index = Number(event.detail.value)
  form.studentId = studentOptions.value[index]?.id || 0
}

function onDateChange(event: any) {
  form.testDate = event.detail.value
}

async function handleSubmit() {
  const testValue = Number(form.testValue)
  if (!form.studentId || !form.testDate || !trimText(form.itemName) || !Number.isFinite(testValue) || testValue <= 0 || !trimText(form.unit)) {
    uni.showToast({ title: '请填写有效的必填字段', icon: 'none' })
    return
  }

  saving.value = true
  try {
    await createFitnessTest({
      studentId: form.studentId,
      testDate: form.testDate,
      itemName: trimText(form.itemName),
      testValue,
      unit: trimText(form.unit),
      comment: trimText(form.comment)
    })
    clearDraft(DRAFT_KEY)
    showSuccess('体测记录已保存')
    setTimeout(() => uni.navigateBack(), 300)
  } catch (error) {
    showError(error, '保存体测记录失败')
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
