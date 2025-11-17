import { db, type SettingRecord } from './db'

export async function getSetting<T = unknown>(key: string) {
  const record = await db.settings.get(key)
  return record?.value as T | undefined
}

export async function setSetting<T = unknown>(key: string, value: T) {
  const payload: SettingRecord<T> = {
    key,
    value,
    updatedAt: new Date().toISOString(),
  }
  await db.settings.put(payload)
}

export async function deleteSetting(key: string) {
  await db.settings.delete(key)
}

export async function getAllSettings() {
  return db.settings.toArray()
}
