# Changelog

All notable changes to the Logseq Snippets plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
