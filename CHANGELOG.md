# Changelog

All notable changes to the Logseq Snippets plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Snippet Manager**: modern dialog to search, create, edit and delete snippets, with variable chips, duplicate highlighting, light/dark theme and autosave
- Command palette entry `Snippets: Manage snippets`
- **Expand On** setting: choose Space, punctuation and/or Tab as expansion keys
- **Enter Key** setting: expand only, expand and create a new block, or never expand on Enter
- **Trigger Prefix** setting (e.g. `;gh`) to rule out accidental expansions
- **Match Capitalisation** setting: `Gm` → capitalised, `GM` → ALL CAPS
- Triggers now expand at the caret position, not only at the end of the block
- **Backspace right after an expansion reverts it** to the typed trigger
- No expansion inside inline code, code blocks, URLs, `[[page refs]]`, `((block refs))` and `{{macros}}`

### Changed
- Single toolbar button opens the manager; import/export moved into it
- Import now asks explicitly whether to append or replace
- Code restructured (`logic/snippets.ts`, `logic/replacer.ts`, `ui/`), React-free `main.ts`, minified build
- Longest matching trigger wins when several match
- Text is now inserted directly at the caret via the browser's editing pipeline instead of rewriting the whole block with `updateBlock`: no lost keystrokes, no flicker, native undo (Ctrl+Z) works
- Settings grouped into Expansion / Notifications / Advanced; the raw snippet text moved to Advanced
- Notifications now default to *errors-only* (existing choices are kept)
- Removed the "Warn About Duplicates" setting (duplicates are shown in the manager)

### Fixed
- Enter no longer expands a snippet while Logseq's autocomplete, slash-command menu or date picker is open
- No accidental expansions during IME composition or when pasting
- `{clipboard}` is read via the host window, so it works even though the plugin iframe has no focus
- Import always replaced existing snippets (the confirmation was never evaluated)
- `{date}` / `{datetime}` used UTC and could show the wrong day around midnight
- `{cursor}` marker was left in the text; the caret is now placed at the marker

## [0.2.1] - 2026-02-15

### Fixed
- Version bump script now correctly displays old version → new version
- Notification system now has three modes: 'always', 'never', 'errors-only'

### Changed
- Notification setting changed from boolean to enum with more options
- Default notification behavior remains 'always' for backward compatibility

## [0.2.0] - 2026-02-15

### Added
- **Case sensitivity option**: Choose between case-sensitive and case-insensitive trigger matching
- **Variable support**: Use `{date}`, `{time}`, `{datetime}`, and `{clipboard}` in snippets
- **Multi-line snippets**: Support for multi-line replacements using `\n`
- **Cursor positioning**: Use `{cursor}` marker to position cursor after expansion
- **Visual feedback**: Notifications when snippets are expanded (can be disabled)
- **Import/Export**: Export and import snippet collections via toolbar buttons
- **Comment support**: Use `#` to add comments in snippet definitions
- **Performance optimization**: Snippet caching to reduce parsing overhead
- **Duplicate detection**: Warnings for duplicate triggers in console
- **Better error handling**: Try-catch blocks around all async operations
- **Event listener cleanup**: Proper cleanup on plugin unload to prevent memory leaks
- **Unicode support**: Improved word boundary detection for international characters

### Changed
- **TypeScript improvements**: Removed `any` types, using proper type annotations
- **Better settings UI**: Improved descriptions with examples and feature documentation
- **Default snippets**: Added helpful examples in default configuration

### Fixed
- Word boundary detection now properly handles Unicode characters
- Event listeners are properly cleaned up when plugin unloads
- Settings changes now properly refresh the snippet cache

## [0.1.6] - 2026-02-15

### Fixed
- Fix snippet triggers and add automatic version bumping

## [0.1.0] - Initial Release

### Added
- Basic text expansion functionality
- Simple `trigger ;; replacement` format
- Space, punctuation, and Enter key trigger support
- Configurable snippets via settings panel
