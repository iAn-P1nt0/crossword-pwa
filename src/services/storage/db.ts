import Dexie, { type Table } from 'dexie'
import type { PuzzleData, PuzzleProgress } from '@/types/puzzle.types'
import type { PuzzleFormat, PuzzleSource, SourceCredentialConfig } from '@/types/source.types'

export interface StoredPuzzleRecord {
  id?: number
  puzzleId: string
  sourceId: string
  title: string
  format: PuzzleFormat
  publishedDate: string
  downloaded: boolean
  data: PuzzleData
  createdAt: string
  updatedAt: string
}

export type PuzzleProgressRecord = PuzzleProgress

export interface SourceConfigRecord {
  id: string
  source: PuzzleSource
  enabled: boolean
  credentials?: SourceCredentialConfig
  lastSyncedAt?: string
  lastDownloadedAt?: string
  error?: string
}

export interface SettingRecord<T = unknown> {
  key: string
  value: T
  updatedAt: string
}

export type DownloadStatus = 'pending' | 'in-progress' | 'complete' | 'error'

export interface DownloadQueueRecord {
  id?: number
  sourceId: string
  puzzleId?: string
  requestedDate: string
  status: DownloadStatus
  priority: number
  error?: string
  retries: number
}

export class CrosswordDB extends Dexie {
  puzzles!: Table<StoredPuzzleRecord, number>
  progress!: Table<PuzzleProgressRecord, string>
  sources!: Table<SourceConfigRecord, string>
  settings!: Table<SettingRecord, string>
  downloads!: Table<DownloadQueueRecord, number>

  constructor() {
    super('CrosswordDB')

    this.version(1).stores({
      puzzles: '++id, puzzleId, sourceId, publishedDate, downloaded',
      progress: '&puzzleId, updatedAt',
      sources: '&id, enabled',
      settings: '&key',
      downloads: '++id, sourceId, status, requestedDate'
    })
  }
}

export const db = new CrosswordDB()
