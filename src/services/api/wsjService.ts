import { downloadAndParsePuzzle } from './puzzleApiService'
import { getSourceById } from './sourceRegistry'
import type { PuzzleApiResult } from '@/types/api.types'
import type { PuzzleSource } from '@/types/source.types'

export interface WsjDownloadOptions {
  date?: string
  signal?: AbortSignal
  cookie?: string
}

export function fetchWsjDailyPuzzle(options: WsjDownloadOptions = {}): Promise<PuzzleApiResult> {
  const source = ensureSource('wsj-daily')
  return downloadAndParsePuzzle({ source, date: options.date, signal: options.signal })
}

export function fetchWsjPremiumPuzzle(options: WsjDownloadOptions = {}): Promise<PuzzleApiResult> {
  const source = ensureSource('wsj-premium')
  const headers = options.cookie ? { Cookie: options.cookie } : {}
  return downloadAndParsePuzzle({
    source: mergeHeaders(source, headers),
    date: options.date,
    signal: options.signal,
  })
}

function ensureSource(id: string): PuzzleSource {
  const source = getSourceById(id)
  if (!source) {
    throw new Error(`Unknown source: ${id}`)
  }
  return source
}

function mergeHeaders(source: PuzzleSource, headers: Record<string, string>) {
  return {
    ...source,
    download: {
      ...source.download,
      headers: { ...(source.download.headers ?? {}), ...headers },
    },
  }
}
