import { db, type PuzzleProgressRecord, type StoredPuzzleRecord } from './db'
import type { PuzzleData, PuzzleProgress } from '@/types/puzzle.types'

const MAX_CACHED_PUZZLES = 30

export async function upsertPuzzle(puzzle: PuzzleData) {
  const timestamp = new Date().toISOString()
  const createdAt = puzzle.createdAt ?? timestamp

  await db.puzzles.put({
    puzzleId: puzzle.puzzleId,
    sourceId: puzzle.metadata.sourceId,
    title: puzzle.metadata.title,
    format: puzzle.format,
    publishedDate: puzzle.metadata.publishedDate,
    downloaded: true,
    data: puzzle,
    createdAt,
    updatedAt: timestamp,
  })

  await enforcePuzzleLimit(MAX_CACHED_PUZZLES)
}

export async function getPuzzleById(puzzleId: string) {
  return db.puzzles.where('puzzleId').equals(puzzleId).first()
}

export async function getRecentPuzzles(limit = 10) {
  return db.puzzles.orderBy('publishedDate').reverse().limit(limit).toArray()
}

export async function removePuzzle(puzzleId: string) {
  const record = await db.puzzles.where('puzzleId').equals(puzzleId).first()
  if (record?.id != null) {
    await db.puzzles.delete(record.id)
  }
  await db.progress.delete(puzzleId)
}

export async function upsertProgress(progress: PuzzleProgress) {
  const payload: PuzzleProgressRecord = {
    ...progress,
    updatedAt: progress.updatedAt ?? new Date().toISOString(),
  }
  await db.progress.put(payload)
}

export async function getProgress(puzzleId: string) {
  return db.progress.get(puzzleId)
}

export async function clearProgress(puzzleId: string) {
  await db.progress.delete(puzzleId)
}

export async function listDownloadQueue() {
  return db.downloads.orderBy('requestedDate').toArray()
}

async function enforcePuzzleLimit(maxRecords: number) {
  const total = await db.puzzles.count()
  if (total <= maxRecords) return

  const surplus = total - maxRecords
  const records = await db.puzzles.orderBy('publishedDate').limit(surplus).toArray()
  const idsToRemove = records.map((record) => record.id).filter((id): id is number => typeof id === 'number')
  if (idsToRemove.length > 0) {
    await db.puzzles.bulkDelete(idsToRemove)
  }
}

export type { StoredPuzzleRecord }
