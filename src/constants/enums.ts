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

export function findLabel<T extends readonly { label: string; value: string }[]>(
  list: T,
  value: string | undefined
): string {
  return list.find(item => item.value === value)?.label ?? '-'
}
