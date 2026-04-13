export function resolveCurrentParentStudentId(
  children: Array<{ id: number }>,
  preferredId?: number | null
): number | null {
  if (!children.length) return null
  if (preferredId && children.some((child) => child.id === preferredId)) {
    return preferredId
  }
  return children[0].id
}
