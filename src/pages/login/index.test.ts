import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const builtLoginWxmlPath = fileURLToPath(
  new URL('../../../dist/build/mp-weixin/pages/login/index.wxml', import.meta.url)
)

describe('mini program login build output', () => {
  it('uses native inputs instead of the stale uview login controls', () => {
    expect(
      existsSync(builtLoginWxmlPath),
      'run npm run build:mp-weixin before checking the built mini program login page'
    ).toBe(true)

    const wxml = readFileSync(builtLoginWxmlPath, 'utf8')

    expect(wxml).toContain('<input')
    expect(wxml).not.toContain('<u-input')
  })

  it('does not import auth modules before the login page is displayed', () => {
    const builtLoginJsPath = fileURLToPath(
      new URL('../../../dist/build/mp-weixin/pages/login/index.js', import.meta.url)
    )
    expect(
      existsSync(builtLoginJsPath),
      'run npm run build:mp-weixin before checking the built mini program login page'
    ).toBe(true)

    const pageJs = readFileSync(builtLoginJsPath, 'utf8')

    expect(pageJs).not.toContain('../../api/modules/auth.js')
  })
})
