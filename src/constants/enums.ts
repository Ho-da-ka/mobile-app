export const genderOptions = [
  { label: '男', value: 'MALE' },
  { label: '女', value: 'FEMALE' }
] as const

export const studentStatusOptions = [
  { label: '在训', value: 'ACTIVE' },
  { label: '停训', value: 'INACTIVE' }
] as const

export const courseStatusOptions = [
  { label: '待开课', value: 'PLANNED' },
  { label: '进行中', value: 'ONGOING' },
  { label: '已结束', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' }
] as const

export const attendanceStatusOptions = [
  { label: '出勤', value: 'PRESENT' },
  { label: '迟到', value: 'LATE' },
  { label: '缺勤', value: 'ABSENT' },
  { label: '请假', value: 'LEAVE' }
] as const

export const trainingIntensityOptions = [
  { label: '低', value: 'LOW' },
  { label: '中', value: 'MEDIUM' },
  { label: '高', value: 'HIGH' }
] as const

export function findLabel<T extends readonly { label: string; value: string }[]>(
  list: T,
  value: string | undefined
): string {
  return list.find(item => item.value === value)?.label ?? '-'
}
