import type { PuzzleApiResult, PuzzleDownloadRequest, PuzzleDownloadResponse } from '@/types/api.types'
import type { PuzzleFormat } from '@/types/source.types'
import type { ParseResult } from '@/types/puzzle.types'

let parserFn: ((blob: Blob, format: PuzzleFormat) => Promise<ParseResult>) | null = null

export function registerPuzzleParser(fn: (blob: Blob, format: PuzzleFormat) => Promise<ParseResult>) {
  parserFn = fn
}

export async function downloadAndParsePuzzle(request: PuzzleDownloadRequest): Promise<PuzzleApiResult> {
  try {
    const response = await fetchPuzzleAsset(request)
    if (!parserFn) {
      throw new Error('Puzzle parser pipeline has not been registered yet.')
    }

    const parsed = await parserFn(response.blob, response.format)
    return {
      puzzle: parsed.data,
      response,
      error: parsed.success ? undefined : { sourceId: response.sourceId, message: parsed.error ?? 'Unknown parser error', retriable: false },
      warnings: parsed.warnings,
    }
  } catch (error) {
    return {
      error: {
        sourceId: request.source.id,
        message: error instanceof Error ? error.message : 'Unknown download error',
        retriable: true,
      },
    }
  }
}

export async function fetchPuzzleAsset({ source, date, signal }: PuzzleDownloadRequest): Promise<PuzzleDownloadResponse> {
  const endpoint = buildRequestUrl(source.download.url, date)
  const response = await fetch(endpoint, {
    method: source.download.method ?? 'GET',
    headers: source.download.headers,
    signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to download puzzle from ${source.name}: ${response.status}`)
  }

  const blob = await response.blob()
  return {
    sourceId: source.id,
    format: source.download.format,
    blob,
    receivedAt: new Date().toISOString(),
    etag: response.headers.get('etag') ?? undefined,
  }
}

function buildRequestUrl(template: string, date?: string) {
  if (!template.includes('{{')) {
    return template
  }

  const targetDate = date ? new Date(date) : new Date()
  const tokens: Record<string, string> = {
    YYYY: targetDate.getUTCFullYear().toString(),
    MM: String(targetDate.getUTCMonth() + 1).padStart(2, '0'),
    DD: String(targetDate.getUTCDate()).padStart(2, '0'),
  }

  return template.replace(/{{(YYYY|MM|DD)}}/g, (_, token: keyof typeof tokens) => tokens[token])
}
