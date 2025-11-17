import type { PuzzleFormat } from '@/types/source.types'
import type { ParseResult } from '@/types/puzzle.types'
import { parsePuz } from './puzParser'
import { parseIpuz } from './ipuzParser'
import { parseJpz } from './jpzParser'
import { parseXd } from './xdParser'

type ParserImpl = (blob: Blob) => Promise<ParseResult>

const parsers: Record<PuzzleFormat, ParserImpl | undefined> = {
  puz: parsePuz,
  ipuz: parseIpuz,
  jpz: parseJpz,
  xd: parseXd,
  json: undefined,
  rss: undefined,
  pdf: undefined,
}

export async function parsePuzzleBlob(blob: Blob, format: PuzzleFormat): Promise<ParseResult> {
  console.log(`[Parser] Parsing ${format} format, blob size: ${blob.size}`)
  const parser = parsers[format]
  
  if (!parser) {
    console.error(`[Parser] No parser registered for format: ${format}`)
    return {
      success: false,
      error: `No parser registered for format: ${format}`,
    }
  }

  const result = await parser(blob)
  console.log(`[Parser] Parse complete:`, { success: result.success, format })
  return result
}
