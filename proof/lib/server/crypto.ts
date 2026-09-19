import 'server-only'
import { createCipheriv, createDecipheriv, createHash, timingSafeEqual } from 'node:crypto'

function encryptionKey() {
  const raw = process.env.APP_ENCRYPTION_KEY
  if (!raw) throw new Error('APP_ENCRYPTION_KEY is not configured')
  const decoded = Buffer.from(raw, 'base64')
  return decoded.length === 32 ? decoded : createHash('sha256').update(raw).digest()
}

export function encryptSecret(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [Buffer.from(iv).toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join('.')
}

export function decryptSecret(value: string) {
  const [iv, tag, encrypted] = value.split('.')
  if (!iv || !tag || !encrypted) throw new Error('Encrypted value has an invalid format')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8')
}

export function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}
