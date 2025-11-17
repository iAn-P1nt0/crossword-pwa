# End-to-End Download Test Plan

## Overview
This document outlines the test plan for verifying the complete puzzle download → parse → store → display flow.

## Prerequisites
- Dev server running at `http://localhost:5173`
- `.env` file with `VITE_ENABLE_REMOTE_SOURCES=true`
- Browser DevTools open (F12)

## Test Procedure

### Phase 1: Access Test Page
1. Open `http://localhost:5173` in Chrome/Firefox
2. Look for 🧪 Test button in bottom-right corner
3. Click the button to navigate to test page

### Phase 2: Trigger Downloads
Test each source individually to isolate issues:

#### Test 1: WSJ Daily (PUZ format)
1. Click "Test WSJ Daily (PUZ)" button
2. **Expected URL**: `https://s.wsj.net/public/resources/documents/XWD11172024.puz`
3. **Expected outcomes**:
   - Console logs show download initiated
   - Network tab shows fetch request
   - Possible CORS error (403) - this is expected without proper headers
   - If successful: parse logs appear, IndexedDB updated

#### Test 2: USA Today (PUZ format)
1. Click "Test USA Today (PUZ)" button
2. **Expected URL**: `https://puzzles.usatoday.com/crossword/2024/11/17/usatoday20241117.puz`
3. **Expected outcomes**:
   - Similar to WSJ test
   - May succeed if CORS headers permit

#### Test 3: Joseph Crosswords (iPUZ format)
1. Click "Test Joseph Crosswords (iPUZ)" button
2. **Expected URL**: `https://josephcrosswords.com/puzzles/2024/11/17.ipuz`
3. **Expected outcomes**:
   - Tests iPUZ parser (not PUZ)
   - Likely 404 (weekly puzzle, not daily)

### Phase 3: Monitor Console Logs
Watch for these log sequences:

```
[DownloadManager] Enqueuing download for wsj-daily
[DownloadManager] Starting task <id> for wsj-daily
[PuzzleApiService] Starting download for wsj-daily
[PuzzleApiService] Fetching from: https://...
[PuzzleApiService] Response status: 200 | 403 | 404
[PuzzleApiService] Blob received, size: X bytes, type: ...
[PuzzleApiService] Parsing puzzle...
[Parser] Parsing puz format, blob size: X
[Parser] Parse complete: { success: true/false, format: 'puz' }
[PuzzleApiService] Parse result: { success: ..., hasData: ..., error: ... }
[DownloadManager] Result: { puzzle: ..., error: ... }
```

### Phase 4: Verify IndexedDB Storage
1. Open DevTools → Application tab → Storage → IndexedDB → CrosswordDB
2. Check tables:
   - **puzzles**: Should have new entry with parsed puzzle data
   - **downloads**: Should have queue record with status 'complete' or 'error'
   - **sources**: Should have updated sync timestamps

### Phase 5: Verify UI Display
1. Go back to main app (click "← Back to App" button)
2. The most recently downloaded puzzle should auto-load
3. Verify:
   - Grid displays with correct dimensions
   - Clues appear in sidebar
   - Puzzle metadata shown in header
   - Can interact with grid (click cells, type letters)

## Expected Issues & Workarounds

### CORS Errors
**Symptom**: `Failed to fetch` or `CORS policy` errors in console  
**Cause**: Browser blocking cross-origin requests without proper headers  
**Workaround**: 
- Use browser CORS extension temporarily
- Or test only sources that allow CORS (unlikely for most puzzle sites)
- Or implement proxy server (future enhancement)

### 403 Forbidden
**Symptom**: HTTP 403 response  
**Cause**: Server requires authentication or specific User-Agent  
**Workaround**: 
- These sources need proper auth (cookie/API key)
- Document as "requires auth" in source registry

### 404 Not Found
**Symptom**: HTTP 404 response  
**Cause**: Puzzle not published yet for today's date, or URL pattern incorrect  
**Workaround**:
- Try previous date (modify URL date tokens)
- Verify URL pattern matches actual site structure

### Parse Errors
**Symptom**: `Parse result: { success: false, error: '...' }`  
**Cause**: 
- Binary corruption during download
- Format mismatch (e.g., HTML error page instead of PUZ file)
- Parser bug

**Debug steps**:
1. Check blob size (should be > 1KB for valid puzzle)
2. Check blob type (should be `application/x-crossword` or `application/octet-stream`)
3. Download file manually and inspect with hex editor
4. Test with known-good sample file

### Storage Errors
**Symptom**: Puzzle parsed but not appearing in app  
**Cause**: 
- Dexie transaction failure
- Schema constraint violation
- Event not dispatched

**Debug steps**:
1. Check browser console for Dexie errors
2. Manually inspect IndexedDB to verify data
3. Check for 'puzzle:downloaded' CustomEvent in Network/Performance tab

## Success Criteria
✅ At least one source downloads successfully (any status code)  
✅ Parser executes without crashing (even if parse fails)  
✅ Download queue persists to IndexedDB  
✅ Error states recorded in source status  
✅ Console logging provides clear diagnostic information  

## Known Limitations
- Most free sources will fail with CORS in browser environment
- Paid sources will fail with 401/403 without credentials
- Some sources publish puzzles at specific times (may not be available yet)
- iPUZ parser not fully tested (few test sources available)

## Next Steps After Testing
1. Document which sources work without CORS issues
2. Implement CORS proxy for development
3. Add authentication flow for paid sources
4. Create sample puzzle fixtures for unit tests
5. Add retry logic with exponential backoff
6. Implement date selector for historical puzzles
7. Add progress indicators in UI
