export function getErrorMessage(error: unknown, fallback = '操作失败'): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

export function showError(error: unknown, fallback = '操作失败'): void {
  uni.showToast({
    title: getErrorMessage(error, fallback),
    icon: 'none',
    duration: 2600
  })
}

export function showSuccess(title: string): void {
  uni.showToast({
    title,
    icon: 'success',
    duration: 1800
  })
}
