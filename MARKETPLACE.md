# Logseq Snippets - Marketplace Submission

## Plugin Information

**Name**: Logseq Snippets
**Version**: 0.2.1
**Author**: Martin Möller
**License**: MIT
**Repository**: https://github.com/martinmoeller/logseq-snippets

## Description

A powerful text expansion plugin for Logseq with dynamic variables, multi-line support, and smart features.

## Short Description (for marketplace)

Transform short triggers into longer text with support for variables, multi-line templates, and customizable behavior. Features include {date}, {time}, {clipboard} variables, import/export, and case-sensitive matching.

## Features

- ✨ **Text Expansion**: Automatically expands keywords into longer text strings
- 📝 **Multi-line Support**: Create complex templates with line breaks using `\n`
- 📅 **Dynamic Variables**: Insert {date}, {time}, {datetime}, {clipboard}
- 🎨 **Cursor Positioning**: Use {cursor} marker for precise placement
- 🔤 **Case Sensitivity**: Optional case-sensitive or case-insensitive matching
- 💾 **Import/Export**: Share snippet collections via toolbar buttons
- 🔔 **Configurable Notifications**: Choose always/never/errors-only
- 💬 **Comments**: Organize snippets with # prefix
- ⚡ **Performance**: Smart caching for instant expansion

## Installation

The plugin is available in the Logseq Marketplace:

1. Open Logseq
2. Go to Settings → Plugins → Marketplace
3. Search for "Logseq Snippets"
4. Click Install

## Quick Start

1. Go to Settings → Plugin Settings → Logseq Snippets
2. Add snippets using format: `trigger ;; replacement`
3. Type the trigger followed by space, punctuation, or Enter

Example:
```
gh ;; GitHub
today ;; {date}
meeting ;; ## Meeting Notes\n- Date: {date}
```

## Screenshots

> Note: Add screenshots before marketplace submission:
> - Settings panel with example snippets
> - Snippet expanding in action
> - Import/Export toolbar buttons
> - Notification examples

## Tags

text-expansion, snippets, productivity, automation, templates, variables

## Category

Productivity

## Marketplace Requirements Checklist

- [x] Plugin builds successfully
- [x] No TypeScript errors
- [x] All features tested
- [x] README.md complete with examples
- [x] LICENSE file included (MIT)
- [x] CHANGELOG.md with version history
- [x] package.json properly configured
- [x] Icon.svg included
- [x] Repository is public
- [ ] Screenshots added to README
- [ ] GitHub release created with dist folder
- [ ] Marketplace submission form completed

## Release Notes v0.2.1

**Major Features:**
- Multi-line snippet support with \n syntax
- Dynamic variables: {date}, {time}, {datetime}, {clipboard}
- Cursor positioning with {cursor} marker
- Case sensitivity option
- Import/Export functionality
- Configurable notifications (always/never/errors-only)
- Comment support with # prefix

**Technical Improvements:**
- Performance optimization with snippet caching
- Full TypeScript strict mode compliance
- Comprehensive error handling
- Event listener cleanup (no memory leaks)
- Unicode support for international characters
- Duplicate trigger detection

**Developer Tools:**
- ESLint and Prettier configuration
- Enhanced version bump script
- Comprehensive documentation

## Support

- **Issues**: https://github.com/martinmoeller/logseq-snippets/issues
- **Discussions**: https://github.com/martinmoeller/logseq-snippets/discussions
- **Email**: moellervdm@gmail.com

## Build Information

- Bundle size: 105.47 KB
- Gzipped: 34.48 KB
- Dependencies: @logseq/libs ^0.0.17
- Node version: Latest LTS recommended
