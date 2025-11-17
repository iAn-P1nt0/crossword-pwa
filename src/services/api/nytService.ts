import { downloadAndParsePuzzle } from './puzzleApiService'
import { getSourceById } from './sourceRegistry'
import type { PuzzleApiResult } from '@/types/api.types'
import type { PuzzleSource } from '@/types/source.types'

export interface NytDownloadOptions {
  date?: string
  signal?: AbortSignal
  cookie?: string
  apiKey?: string
}

export async function fetchNytPuzzle(options: NytDownloadOptions = {}): Promise<PuzzleApiResult> {
  const source = ensureSource('nyt-premium')
  const headers = sanitizeHeaders({
    Cookie: options.cookie,
    'nyt-s': options.apiKey,
  })

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

function sanitizeHeaders(headers: Record<string, string | undefined>) {
  const clean: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (value) {
      clean[key] = value
    }
  }
  return clean
}
