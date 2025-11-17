import { downloadAndParsePuzzle } from './puzzleApiService'
import { getSourceById } from './sourceRegistry'
import type { PuzzleApiResult } from '@/types/api.types'
import type { PuzzleSource } from '@/types/source.types'

export interface GuardianDownloadOptions {
  date?: string
  signal?: AbortSignal
  apiKey: string
}

export function fetchGuardianPuzzle(options: GuardianDownloadOptions): Promise<PuzzleApiResult> {
  if (!options.apiKey) {
    throw new Error('Guardian API key is required')
  }

  const source = ensureSource('guardian-cryptic')
  const enrichedSource: PuzzleSource = {
    ...source,
    download: {
      ...source.download,
      url: `${source.download.url}&api-key=${encodeURIComponent(options.apiKey)}`,
    },
  }

  return downloadAndParsePuzzle({ source: enrichedSource, date: options.date, signal: options.signal })
}

function ensureSource(id: string): PuzzleSource {
  const source = getSourceById(id)
  if (!source) {
    throw new Error(`Unknown source: ${id}`)
  }
  return source
}
