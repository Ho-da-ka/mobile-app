import { describe, expect, it } from 'vitest'
import { resolveCurrentParentStudentId } from './parent-home'

describe('resolveCurrentParentStudentId', () => {
  it('falls back to the first bound child when there is no preferred id', () => {
    const children = [{ id: 11, name: '乐乐' }, { id: 22, name: '安安' }] as Array<{ id: number; name: string }>
    expect(resolveCurrentParentStudentId(children, null)).toBe(11)
  })
})
