# Summary of Changes - v0.2.1

## Issues Addressed

### 1. ✅ Version Display Fix
**Problem**: Version bump script showed incorrect output like "0.1.7 → 0.1.7"

**Solution**:
- Store old version before updating
- Display format: "0.2.0 → 0.2.1"
- File: `scripts/bump-version.js`

### 2. ✅ Enhanced Notification System
**Request**: Configurable notification options for snippet expansion

**Solution**:
Changed from simple boolean (on/off) to three-option enum:
- **Always** (default): Show success and error notifications
- **Never**: Silent mode, no notifications at all
- **Errors-only**: Only show error notifications, hide success messages

**Benefits**:
- Users who want quiet operation can choose "never"
- Users who only want to know about problems can choose "errors-only"
- Default behavior unchanged for existing users
- Better user experience and control

**Implementation**:
- Updated `src/main.tsx`: Changed setting from boolean to enum with radio picker
- Updated `src/logic/replacer.ts`: Added `showNotification()` helper function
- Function checks setting and displays appropriate notifications

## Files Modified

1. **scripts/bump-version.js**
   - Fixed version display logic
   - Now shows: `✓ Bumped patch version: 0.2.0 → 0.2.1`

2. **src/main.tsx**
   - Changed `showNotifications` setting from boolean to enum
   - Options: 'always', 'never', 'errors-only'
   - Default: 'always' (backward compatible)

3. **src/logic/replacer.ts**
   - Added `showNotification()` helper function
   - Replaced inline notification logic with helper calls
   - Respects new notification setting

4. **README.md**
   - Updated settings table with notification options
   - Added explanation of each notification mode

5. **CHANGELOG.md**
   - Added v0.2.1 entry
   - Documented both fixes

6. **IMPROVEMENTS.md**
   - Added latest updates section
   - Documented version display and notification enhancements

## Testing

- ✅ Build successful: 105.47 KB (34.48 KB gzipped)
- ✅ No TypeScript errors
- ✅ Version bump script displays correctly
- ✅ All notification modes compile correctly

## Current Version

**v0.2.1** (incremented from v0.2.0)

## Next Steps

1. Test the plugin in Logseq
2. Verify all three notification modes work:
   - Set to "always" → should see success notifications
   - Set to "never" → should see no notifications
   - Set to "errors-only" → should only see errors
3. Ready for commit and release
