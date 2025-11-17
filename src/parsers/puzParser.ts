import type { ParseResult } from '@/types/puzzle.types'

export async function parsePuz(blob: Blob): Promise<ParseResult> {
  void blob
  // TODO: integrate @xwordly/xword-parser or custom PUZ parser
  return {
    success: false,
    error: 'PUZ parsing not implemented yet',
  }
}
