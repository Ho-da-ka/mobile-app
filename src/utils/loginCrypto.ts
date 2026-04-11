import CryptoJS from 'crypto-js'

const LOGIN_AES_KEY = import.meta.env.VITE_LOGIN_AES_KEY || 'ZFLoginCryptoKey2026ForDemo12345'

export interface EncryptedLoginPassword {
  encryptedPassword: string
  iv: string
}

export function encryptLoginPassword(password: string): EncryptedLoginPassword {
  const iv = CryptoJS.lib.WordArray.random(16)
  const key = CryptoJS.enc.Utf8.parse(LOGIN_AES_KEY)
  const encrypted = CryptoJS.AES.encrypt(password, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })

  return {
    encryptedPassword: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
    iv: CryptoJS.enc.Base64.stringify(iv)
  }
}

