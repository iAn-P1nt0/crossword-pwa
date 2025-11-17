import type { PuzzleData } from './puzzle.types'
import type { PuzzleFormat, PuzzleSource } from './source.types'

export interface PuzzleDownloadRequest {
  source: PuzzleSource
  date?: string
  signal?: AbortSignal
  forceRefresh?: boolean
}

export interface PuzzleDownloadResponse {
  sourceId: string
  format: PuzzleFormat
  blob: Blob
  receivedAt: string
  etag?: string
  cacheKey?: string
}

export interface PuzzleApiResult {
  puzzle?: PuzzleData
  response?: PuzzleDownloadResponse
  error?: PuzzleApiError
  warnings?: string[]
}

export interface PuzzleApiError {
  sourceId: string
  status?: number
  message: string
  retriable: boolean
}

export interface RssEntry {
  id: string
  title: string
  published: string
  link: string
  enclosureUrl?: string
  enclosureType?: string
  summary?: string
}

export interface SyncWindow {
  start: string
  end: string
  timezone?: string
}
