<template>
  <view class="page">
    <view class="card">
      <view class="title">{{ isCreate ? '新增教练' : '编辑教练' }}</view>

      <view v-if="isCreate" style="margin-top: 20rpx">
        <view class="required">教练编号</view>
        <input class="input" v-model="form.coachCode" placeholder="请输入教练编号" maxlength="32" />
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
        <view>手机号</view>
        <input class="input" v-model="form.phone" placeholder="请输入手机号" maxlength="20" />
      </view>

      <view style="margin-top: 20rpx">
        <view>擅长方向</view>
        <textarea class="textarea" v-model="form.specialty" maxlength="255" placeholder="请输入擅长方向" />
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
  createCoach,
  getCoach,
  updateCoach,
  type CoachCreatePayload,
  type CoachUpdatePayload
} from '@/api/modules/coaches'
import { coachStatusOptions, genderOptions as genderList } from '@/constants/enums'
import { isLoggedIn } from '@/store/auth'
import { clearDraft, loadDraft, saveDraft } from '@/utils/draft'
import { showError, showSuccess } from '@/utils/error'
import { GUARDIAN_PHONE_REGEX, trimText } from '@/utils/validators'

const mode = ref<'create' | 'edit'>('create')
const coachId = ref(0)
const saving = ref(false)
const ready = ref(false)
const draftKey = ref('coaches.form.create.new')

const form = reactive({
  coachCode: '',
  name: '',
  gender: 'MALE' as 'MALE' | 'FEMALE',
  phone: '',
  specialty: '',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  remarks: ''
})

const isCreate = computed(() => mode.value === 'create')
const genderOptions = genderList
const statusOptions = coachStatusOptions

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
  draftKey.value = `coaches.form.${mode.value}.${coachId.value || 'new'}`
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

function validate(): string | null {
  if (isCreate.value && !trimText(form.coachCode)) return '请填写教练编号'
  if (!trimText(form.name)) return '请填写姓名'

  const phone = trimText(form.phone)
  if (!GUARDIAN_PHONE_REGEX.test(phone || '')) {
    return '手机号格式不正确（支持 6-20 位数字或 +、-）'
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
    const createPayload: CoachCreatePayload = {
      coachCode: trimText(form.coachCode),
      name: trimText(form.name),
      gender: form.gender,
      phone: trimText(form.phone),
      specialty: trimText(form.specialty),
      status: form.status,
      remarks: trimText(form.remarks)
    }

    if (isCreate.value) {
      const created = await createCoach(createPayload)
      showSuccess('教练创建成功')

      const username = `coach_${(created.coachCode || '').toLowerCase()}`
      const initialPassword = `${created.coachCode}@123`
      await new Promise<void>((resolve) => {
        uni.showModal({
          title: '创建成功',
          content: `登录账号：${username}\n初始密码：${initialPassword}`,
          showCancel: false,
          success: () => resolve()
        })
      })
    } else {
      const updatePayload: CoachUpdatePayload = {
        name: createPayload.name,
        gender: createPayload.gender,
        phone: createPayload.phone,
        specialty: createPayload.specialty,
        status: createPayload.status,
        remarks: createPayload.remarks
      }
      await updateCoach(coachId.value, updatePayload)
      showSuccess('教练更新成功')
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
  coachId.value = Number(query?.id || 0)
  buildDraftKey()

  if (mode.value === 'edit' && coachId.value) {
    try {
      const data = await getCoach(coachId.value)
      assignForm({
        coachCode: data.coachCode,
        name: data.name,
        gender: data.gender,
        phone: data.phone,
        specialty: data.specialty,
        status: data.status,
        remarks: data.remarks
      })
    } catch (error) {
      showError(error, '加载教练信息失败')
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
