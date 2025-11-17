import { db, type SourceConfigRecord } from './db'

export async function upsertSourceConfig(record: SourceConfigRecord) {
  await db.sources.put(record)
}

export async function getSourceConfig(id: string) {
  return db.sources.get(id)
}

export async function getAllSourceConfigs() {
  return db.sources.toArray()
}

export async function deleteSourceConfig(id: string) {
  await db.sources.delete(id)
}
