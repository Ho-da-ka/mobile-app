<template>
  <view class="page">
    <view class="card">
      <view class="title">{{ isCreate ? '新增学员' : '编辑学员' }}</view>

      <view v-if="isCreate" style="margin-top: 20rpx">
        <view class="required">学号</view>
        <input class="input" v-model="form.studentNo" placeholder="请输入学号" maxlength="32" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">姓名</view>
        <input class="input" v-model="form.name" placeholder="请输入姓名" maxlength="64" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">性别</view>
        <picker :range="genderOptions" range-key="label" :value="genderIndex" @change="onGenderChange">
          <view class="picker">{{ genderLabel }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">出生日期</view>
        <picker mode="date" :value="form.birthDate" @change="onBirthDateChange">
          <view class="picker">{{ form.birthDate || '请选择出生日期' }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view>监护人姓名</view>
        <input class="input" v-model="form.guardianName" placeholder="请输入监护人姓名" maxlength="64" />
      </view>

      <view style="margin-top: 20rpx">
        <view>监护人电话</view>
        <input class="input" v-model="form.guardianPhone" placeholder="请输入监护人电话" maxlength="20" />
      </view>

      <view style="margin-top: 20rpx">
        <view class="required">状态</view>
        <picker :range="statusOptions" range-key="label" :value="statusIndex" @change="onStatusChange">
          <view class="picker">{{ statusLabel }}</view>
        </picker>
      </view>

      <view style="margin-top: 20rpx">
        <view>备注</view>
        <textarea class="textarea" v-model="form.remarks" maxlength="255" placeholder="请输入备注" />
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
  createStudent,
  getStudent,
  updateStudent,
  type StudentCreatePayload,
  type StudentUpdatePayload
} from '@/api/modules/students'
import { isLoggedIn } from '@/store/auth'
import { clearDraft, loadDraft, saveDraft } from '@/utils/draft'
import { showError, showSuccess } from '@/utils/error'
import { GUARDIAN_PHONE_REGEX, isFutureDate, trimText } from '@/utils/validators'
import { genderOptions as genderList, studentStatusOptions } from '@/constants/enums'

const mode = ref<'create' | 'edit'>('create')
const studentId = ref(0)
const saving = ref(false)
const ready = ref(false)
const draftKey = ref('students.form.create.new')

const form = reactive({
  studentNo: '',
  name: '',
  gender: 'MALE' as 'MALE' | 'FEMALE',
  birthDate: '',
  guardianName: '',
  guardianPhone: '',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  remarks: ''
})

const isCreate = computed(() => mode.value === 'create')
const genderOptions = genderList
const statusOptions = studentStatusOptions

const genderIndex = computed(() => genderOptions.findIndex(item => item.value === form.gender))
const statusIndex = computed(() => statusOptions.findIndex(item => item.value === form.status))
const genderLabel = computed(() => genderOptions.find(item => item.value === form.gender)?.label || '-')
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
  draftKey.value = `students.form.${mode.value}.${studentId.value || 'new'}`
}

function restoreDraft() {
  const draft = loadDraft(draftKey.value, null as Partial<typeof form> | null)
  if (draft) {
    assignForm(draft)
  }
}

function onGenderChange(event: any) {
  const index = Number(event.detail.value)
  form.gender = genderOptions[index]?.value || 'MALE'
}

function onStatusChange(event: any) {
  const index = Number(event.detail.value)
  form.status = statusOptions[index]?.value || 'ACTIVE'
}

function onBirthDateChange(event: any) {
  form.birthDate = event.detail.value
}

function validate(): string | null {
  if (isCreate.value && !trimText(form.studentNo)) return '请填写学号'
  if (!trimText(form.name)) return '请填写姓名'
  if (!form.birthDate) return '请选择出生日期'
  if (isFutureDate(form.birthDate)) return '出生日期不能晚于今天'

  const phone = trimText(form.guardianPhone)
  if (!GUARDIAN_PHONE_REGEX.test(phone || '')) {
    return '监护人电话格式不正确（支持6-20位数字或+、-）'
  }

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
    const createPayload: StudentCreatePayload = {
      studentNo: trimText(form.studentNo),
      name: trimText(form.name),
      gender: form.gender,
      birthDate: form.birthDate,
      guardianName: trimText(form.guardianName),
      guardianPhone: trimText(form.guardianPhone),
      status: form.status,
      remarks: trimText(form.remarks)
    }

    if (isCreate.value) {
      await createStudent(createPayload)
      showSuccess('学员创建成功')
    } else {
      const updatePayload: StudentUpdatePayload = {
        name: createPayload.name,
        gender: createPayload.gender,
        birthDate: createPayload.birthDate,
        guardianName: createPayload.guardianName,
        guardianPhone: createPayload.guardianPhone,
        status: createPayload.status,
        remarks: createPayload.remarks
      }
      await updateStudent(studentId.value, updatePayload)
      showSuccess('学员更新成功')
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
  studentId.value = Number(query?.id || 0)
  buildDraftKey()

  if (mode.value === 'edit' && studentId.value) {
    try {
      const data = await getStudent(studentId.value)
      assignForm({
        studentNo: data.studentNo,
        name: data.name,
        gender: data.gender,
        birthDate: data.birthDate,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        status: data.status,
        remarks: data.remarks
      })
    } catch (error) {
      showError(error, '加载学员信息失败')
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

