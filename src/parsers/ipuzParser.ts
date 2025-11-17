import type { ParseResult } from '@/types/puzzle.types'

export async function parseIpuz(blob: Blob): Promise<ParseResult> {
  void blob
  // TODO: implement iPUZ JSON parsing per spec
  return {
    success: false,
    error: 'iPUZ parsing not implemented yet',
  }
}
