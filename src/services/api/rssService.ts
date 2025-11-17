import type { RssEntry } from '@/types/api.types'
import { fetchWithRetry } from './httpClient'

export async function fetchRssFeed(url: string, signal?: AbortSignal): Promise<RssEntry[]> {
  const response = await fetchWithRetry(url, { signal, headers: { Accept: 'application/rss+xml, application/xml' } })
  const xml = await response.text()
  return parseRss(xml)
}

function parseRss(xml: string): RssEntry[] {
  if (typeof DOMParser === 'undefined') {
    throw new Error('DOMParser is not available in this environment')
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')
  const items = Array.from(doc.querySelectorAll('item'))

  return items.map((item) => {
    const published = textContent(item, 'pubDate') ?? new Date().toISOString()
    return {
      id: textContent(item, 'guid') ?? textContent(item, 'link') ?? `${published}-${Math.random()}`,
      title: textContent(item, 'title') ?? 'Untitled Entry',
      published,
      link: textContent(item, 'link') ?? '',
      enclosureUrl: item.querySelector('enclosure')?.getAttribute('url') ?? undefined,
      enclosureType: item.querySelector('enclosure')?.getAttribute('type') ?? undefined,
      summary: textContent(item, 'description') ?? undefined,
    }
  })
}

function textContent(parent: Element, selector: string) {
  return parent.querySelector(selector)?.textContent?.trim() ?? undefined
}
