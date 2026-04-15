import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const componentDir = dirname(fileURLToPath(import.meta.url))

function readComponentSource(filename: string): string {
  return readFileSync(resolve(componentDir, filename), 'utf8')
}

describe('parent home presentation components', () => {
  it('renders the hero reminder badge with the fixed text contract', () => {
    const source = readComponentSource('ParentHomeHero.vue')

    expect(source).toContain('{{ hero.unreadCount }} 条提醒')
    expect(source).not.toContain('v-if="hero.unreadCount"')
  })

  it('keeps the approved action section title copy', () => {
    const source = readComponentSource('ParentHomeActionSection.vue')

    expect(source).toContain('<view class="section-title">常用功能</view>')
  })
})
