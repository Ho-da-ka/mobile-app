const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

export function encodeBase64(input: string): string {
  const str = unescape(encodeURIComponent(input))
  let output = ''
  let i = 0

  while (i < str.length) {
    const c1 = str.charCodeAt(i++)
    const c2 = str.charCodeAt(i++)
    const c3 = str.charCodeAt(i++)

    const e1 = c1 >> 2
    const e2 = ((c1 & 3) << 4) | (c2 >> 4)
    const e3 = Number.isNaN(c2) ? 64 : ((c2 & 15) << 2) | (c3 >> 6)
    const e4 = Number.isNaN(c3) ? 64 : c3 & 63

    output += chars.charAt(e1)
    output += chars.charAt(e2)
    output += e3 === 64 ? '=' : chars.charAt(e3)
    output += e4 === 64 ? '=' : chars.charAt(e4)
  }

  return output
}
