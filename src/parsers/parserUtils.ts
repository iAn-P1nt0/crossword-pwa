import type { ParseResult } from '@/types/puzzle.types'

export function parserError(format: string, error: unknown): ParseResult {
  const message = error instanceof Error ? error.message : 'Unknown parser error'
  return {
    success: false,
    error: `${format} parser failed: ${message}`,
  }
}
