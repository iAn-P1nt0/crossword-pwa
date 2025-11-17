# Download Flow Console Log Reference

## Normal Success Flow

```
[DownloadManager] Enqueuing download for wsj-daily { date: undefined }
[DownloadManager] Starting task download-wsj-daily-1234 for wsj-daily
[PuzzleApiService] Starting download for wsj-daily
[PuzzleApiService] Fetching from: https://s.wsj.net/public/resources/documents/XWD11172024.puz
[PuzzleApiService] Response status: 200
[PuzzleApiService] Blob received, size: 12345 bytes, type: application/octet-stream
[PuzzleApiService] Parsing puzzle...
[Parser] Parsing puz format, blob size: 12345
[Parser] Parse complete: { success: true, format: 'puz' }
[PuzzleApiService] Parse result: { success: true, hasData: true, error: undefined }
[DownloadManager] Puzzle parsed successfully, upserting to storage
[DownloadManager] Result: { puzzle: {...}, response: {...} }
```

**What happened**: Perfect flow! Puzzle downloaded, parsed, and stored.

## CORS Failure

```
[DownloadManager] Enqueuing download for wsj-daily { date: undefined }
[DownloadManager] Starting task download-wsj-daily-1234 for wsj-daily
[PuzzleApiService] Starting download for wsj-daily
[PuzzleApiService] Fetching from: https://s.wsj.net/public/resources/documents/XWD11172024.puz
❌ Access to fetch at 'https://s.wsj.net/...' from origin 'http://localhost:5173' has been blocked by CORS policy
[DownloadManager] Error: TypeError: Failed to fetch
```

**What happened**: Browser blocked request due to missing CORS headers from server.

**Fix**: 
- Add CORS proxy: `https://corsproxy.io/?url=<encoded-url>`
- Or use browser extension like "CORS Unblock"
- Or run in production environment with server-side proxy

## HTTP Error (403, 404, etc.)

```
[DownloadManager] Enqueuing download for nyt-premium
[DownloadManager] Starting task download-nyt-premium-5678 for nyt-premium
[PuzzleApiService] Starting download for nyt-premium
[PuzzleApiService] Fetching from: https://www.nytimes.com/svc/crosswords/v2/puzzle/standard/2024-11-17.puz
[PuzzleApiService] Response status: 403
[PuzzleApiService] Download/parse error: Error: Failed to download puzzle from New York Times: 403
[DownloadManager] Result: { error: { sourceId: 'nyt-premium', message: 'Failed to download...', retriable: true } }
[DownloadManager] Parse failed: Failed to download puzzle from New York Times: 403
```

**What happened**: Server returned error status code.

**Common causes**:
- 403: Authentication required (need login cookie or API key)
- 404: Puzzle not published yet, or wrong URL pattern
- 429: Rate limited (too many requests)
- 500: Server error

## Parse Failure

```
[DownloadManager] Enqueuing download for joseph-crosswords
[PuzzleApiService] Fetching from: https://josephcrosswords.com/puzzles/2024/11/17.ipuz
[PuzzleApiService] Response status: 200
[PuzzleApiService] Blob received, size: 487 bytes, type: text/html
[PuzzleApiService] Parsing puzzle...
[Parser] Parsing ipuz format, blob size: 487
[Parser] Parse complete: { success: false, format: 'ipuz' }
[PuzzleApiService] Parse result: { success: false, hasData: false, error: '...' }
[DownloadManager] Parse failed: Invalid iPUZ structure
```

**What happened**: Downloaded successfully, but parser couldn't interpret the data.

**Common causes**:
- Received HTML error page instead of puzzle file (check blob.type)
- Format mismatch (server sent JSON but source configured for PUZ)
- Corrupted download (check blob.size)
- Parser bug (valid file but code has error)

**Debug**:
1. Check blob.size - should be > 1KB for real puzzle
2. Check blob.type - should match expected format
3. Download URL manually in browser to inspect actual content

## Storage Failure

```
[Parser] Parse complete: { success: true, format: 'puz' }
[PuzzleApiService] Parse result: { success: true, hasData: true }
[DownloadManager] Puzzle parsed successfully, upserting to storage
❌ DexieError: Failed to add puzzle to database: ConstraintError
[DownloadManager] Error: DexieError: ConstraintError
```

**What happened**: Puzzle parsed OK, but IndexedDB rejected it.

**Common causes**:
- Duplicate primary key (puzzle already exists)
- Schema constraint violation (missing required field)
- Quota exceeded (browser storage full)
- Database version mismatch

**Fix**: Open DevTools → Application → IndexedDB → Clear storage and retry

## No Parser Registered

```
[Parser] Parsing json format, blob size: 5432
[Parser] No parser registered for format: json
[PuzzleApiService] Parse result: { success: false, error: 'No parser registered for format: json' }
```

**What happened**: Source configured for format without parser implementation.

**Fix**: Implement parser for that format (json, jpz, xd, etc.)

## Quick Diagnostic Checklist

| Symptom | Check | Likely Cause |
|---------|-------|--------------|
| No logs appear | DevTools open? Test button clicked? | UI not wired correctly |
| Stops at "Fetching from..." | Network tab shows request? | CORS or network error |
| 403 status | Source requiresAuth=true? | Need credentials |
| 404 status | URL pattern correct? Date valid? | Wrong URL or no puzzle available |
| Small blob (<1KB) | Check Network response preview | Got error page, not puzzle |
| Parse fails | Blob type matches format? | Format mismatch |
| No storage | IndexedDB visible in DevTools? | Dexie not initialized |
| Puzzle not displayed | Check 'puzzle:downloaded' event | Event not firing or not subscribed |

## Testing Tips

1. **Start with USA Today** - historically most reliable free source
2. **Check Network tab first** - see actual HTTP responses before diving into code
3. **Test one source at a time** - isolate issues
4. **Use smaller test datasets** - don't spam servers with repeated requests
5. **Check browser console AND Network tab** - different info in each
6. **Inspect IndexedDB** - verify data actually saved
7. **Look for Custom Events** - 'puzzle:downloaded' should fire on success

## Useful DevTools Commands

```javascript
// Check if parser registered
console.log(window.__VITE_ENV__ || import.meta.env)

// Manually check IndexedDB
indexedDB.databases().then(console.log)

// List all puzzles in storage
import('/src/services/storage/db.js').then(m => m.db.puzzles.toArray().then(console.log))

// Check sources store
import('/src/stores/useSourcesStore.js').then(m => console.log(m.default.getState()))

// Trigger manual sync
import('/src/services/sync/syncService.js').then(m => m.triggerManualSync())

// Subscribe to download events
import('/src/services/sync/downloadManager.js').then(m => 
  m.subscribeDownloads(event => console.log('Download event:', event))
)
```

## Expected Test Results

Given typical browser CORS restrictions:

| Source | Format | Expected Result |
|--------|--------|----------------|
| wsj-daily | puz | CORS error (403) |
| usa-today | puz | CORS error OR success (varies) |
| la-times | puz | CORS error |
| joseph-crosswords | ipuz | 404 (weekly, not daily) OR CORS |
| nyt-premium | puz | 403 (auth required) |

**Success = Getting past "Fetching from..." stage**, even if CORS blocks it. This proves the pipeline is wired correctly.
