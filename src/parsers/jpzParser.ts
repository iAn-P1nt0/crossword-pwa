import type { ParseResult } from '@/types/puzzle.types'

export async function parseJpz(blob: Blob): Promise<ParseResult> {
  void blob
  // TODO: parse JPZ XML using fast-xml-parser
  return {
    success: false,
    error: 'JPZ parsing not implemented yet',
  }
}
