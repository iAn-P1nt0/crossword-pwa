# All Sources Enabled - Testing Guide

## What Changed

### ✅ Enabled Sources
All previously disabled sources have been enabled (`defaultEnabled: true`):

**Weekly Free Sources:**
- Joseph Crosswords (iPUZ format)
- Jonesin' Crosswords (PUZ format)
- Erik Agard Weekly (iPUZ format)
- Chronicle of Higher Education (PUZ format)
- CrosSynergy / Washington Post (PUZ format)

**Paid Sources:**
- WSJ Premium (PUZ format) - requires subscription
- Guardian Cryptic (iPUZ format) - requires API key

**Already Enabled (Daily Free):**
- Wall Street Journal Daily
- USA Today
- Los Angeles Times
- Universal Crossword
- Newsday (Stan Newman)

**Already Enabled (Paid):**
- New York Times Premium

## Total Sources: 13

## How to Test

### Option 1: Individual Testing
1. Open http://localhost:5173
2. Click 🧪 Test button in bottom-right corner
3. Choose from organized categories:
   - **Free Daily Sources** (6 sources)
   - **Weekly Sources** (4 sources) 
   - **Paid Sources** (3 sources)
4. Click individual buttons to test one source at a time
5. Monitor browser console for detailed logs

### Option 2: Bulk Testing (Recommended)
1. Open http://localhost:5173
2. Click 🧪 Test button
3. Click "→ Switch to Bulk Test Runner (test all sources)" link
4. Click "▶️ Run All Tests" button
5. Watch as all 13 sources are tested sequentially
6. Results displayed in table with status indicators

## What to Expect

### Free Daily Sources
| Source | Format | Expected Result |
|--------|--------|----------------|
| WSJ Daily | PUZ | CORS block or success |
| USA Today | PUZ | CORS block or success |
| LA Times | PUZ | CORS block |
| Universal | PUZ | CORS block |
| Newsday | PUZ | CORS block |
| WaPo/CrosSynergy | PUZ | CORS block |

### Weekly Sources
| Source | Format | Expected Result |
|--------|--------|----------------|
| Joseph Crosswords | iPUZ | 404 (not daily) or CORS |
| Jonesin' | PUZ | 404 (not daily) or CORS |
| Erik Agard | iPUZ | 404 (not daily) or CORS |
| Chronicle HE | PUZ | 404 (not daily) or CORS |

**Note**: Weekly sources publish on specific days, so 404 errors are expected for most dates.

### Paid Sources
| Source | Format | Expected Result |
|--------|--------|----------------|
| NYT Premium | PUZ | 403 (auth required) |
| WSJ Premium | PUZ | 403 (auth required) |
| Guardian Cryptic | iPUZ | 401/403 (API key required) |

## Interpreting Results

### Success Indicators
Even if CORS blocks the actual download, success means:
- ✅ Download request initiated
- ✅ URL constructed correctly with date tokens
- ✅ Download manager queue processed
- ✅ Parser attempted to run (if data received)

### Console Log Patterns

**Successful flow (rare in browser dev):**
```
[DownloadManager] Enqueuing download for <source-id>
[DownloadManager] Starting task...
[PuzzleApiService] Fetching from: https://...
[PuzzleApiService] Response status: 200
[PuzzleApiService] Blob received, size: X bytes
[Parser] Parsing puz format...
[Parser] Parse complete: { success: true }
[DownloadManager] Puzzle parsed successfully
```

**CORS block (most common):**
```
[DownloadManager] Enqueuing download for <source-id>
[PuzzleApiService] Fetching from: https://...
❌ CORS policy: No 'Access-Control-Allow-Origin' header
[DownloadManager] Error: Failed to fetch
```

**Authentication required:**
```
[PuzzleApiService] Response status: 403
[DownloadManager] Parse failed: Failed to download... 403
```

**Not found (weekly puzzles):**
```
[PuzzleApiService] Response status: 404
[DownloadManager] Parse failed: Failed to download... 404
```

## Monitoring Tools

### Browser DevTools
1. **Console** - See detailed logs from download pipeline
2. **Network** - View actual HTTP requests/responses
3. **Application** → IndexedDB → CrosswordDB
   - `puzzles` table - Successfully downloaded puzzles
   - `downloads` table - Queue history with status
   - `sources` table - Sync timestamps and errors

### Storage Inspection
Check if puzzles were stored:
```javascript
// In browser console
indexedDB.databases().then(console.log)

// List all puzzles
import('/src/services/storage/db.js').then(m => 
  m.db.puzzles.toArray().then(console.log)
)

// Check source sync status
import('/src/stores/useSourcesStore.js').then(m => 
  console.log(m.default.getState().status)
)
```

## Known Working Sources

Based on community reports, these sources historically work:
- **Herbach mirrors** (Jonesin', WaPo) - usually CORS-friendly
- **USA Today** - intermittently allows CORS
- **Amuse Labs CDN** (LAT, Universal) - varies

All others require:
- CORS proxy in production
- Server-side download proxy
- Browser extension to bypass CORS (dev only)

## Next Steps

1. **Run Bulk Test** - Get overview of all sources
2. **Review Console Logs** - Identify patterns
3. **Check IndexedDB** - See which puzzles actually downloaded
4. **Document Results** - Note which sources work without CORS
5. **Implement CORS Proxy** - For production deployment
6. **Add Auth Flow** - For paid sources (NYT, WSJ, Guardian)

## Testing Tips

- **Test one at a time first** to isolate issues
- **Check Network tab** before console - see raw HTTP responses
- **Test at different times** - some puzzles publish at midnight in their timezone
- **Be patient** - Rate limits may apply
- **Don't spam** - Sequential testing respects servers better
- **Use bulk test for overview** - Then drill down on specific sources

## Files Modified

- `src/services/api/sourceRegistry.ts` - Enabled all sources
- `src/components/debug/TestDownload.tsx` - Added all source buttons + bulk test link
- `src/components/debug/BulkTestRunner.tsx` - NEW: Automated testing for all sources

## Dev Server

Running at: http://localhost:5173
Access test page: Click 🧪 Test button in bottom-right corner

Ready to test! 🚀
