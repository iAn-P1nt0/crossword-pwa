import type { ParseResult } from '@/types/puzzle.types'

export async function parseXd(blob: Blob): Promise<ParseResult> {
  void blob
  // TODO: implement XD plaintext parser
  return {
    success: false,
    error: 'XD parsing not implemented yet',
  }
}
