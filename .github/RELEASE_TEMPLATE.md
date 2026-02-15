# v0.2.1 - Major Feature Update

A powerful text expansion plugin for Logseq with dynamic variables, multi-line support, and smart features.

## 🎉 New Features

### Text Expansion Enhancements
- ✨ **Multi-line snippets** - Use `\n` to create complex templates
- 📅 **Dynamic variables** - Insert `{date}`, `{time}`, `{datetime}`, `{clipboard}`
- 🎯 **Cursor positioning** - Use `{cursor}` marker to place cursor after expansion
- 💬 **Comments** - Organize snippets with `#` prefix

### Customization Options
- 🔤 **Case sensitivity** - Toggle case-sensitive or case-insensitive matching
- 🔔 **Configurable notifications** - Choose always / never / errors-only
- 💾 **Import/Export** - Share snippet collections via toolbar buttons

## 🔧 Technical Improvements

- ⚡ **Performance** - Snippet caching reduces parsing overhead
- 🛡️ **Type Safety** - Full TypeScript strict mode compliance
- 🔒 **Error Handling** - Comprehensive try-catch blocks
- 🧹 **Memory Management** - Event listener cleanup prevents leaks
- 🌍 **Unicode Support** - Better word boundaries for international characters
- ⚠️ **Validation** - Duplicate trigger detection and warnings

## 📚 Documentation & Developer Experience

- Comprehensive README with examples and troubleshooting guide
- Complete CHANGELOG following Keep a Changelog format
- ESLint and Prettier configuration for code quality
- Enhanced version bump script (major/minor/patch)
- Full test coverage with TypeScript strict mode

## 💡 Quick Start

1. Install from Logseq Marketplace
2. Go to Settings → Plugin Settings → Logseq Snippets
3. Add snippets using format: `trigger ;; replacement`

### Example Snippets

```
# Simple text expansion
gh ;; GitHub
gm ;; Good Morning

# Dynamic variables
today ;; {date}
now ;; {datetime}
paste ;; {clipboard}

# Multi-line templates
meeting ;; ## Meeting Notes\n- Date: {date}\n- Attendees: \n- Topics:
standup ;; ## Daily Standup\n\n### Yesterday\n- \n\n### Today\n- \n\n### Blockers\n- None

# With cursor positioning
link ;; [text]({cursor})
code ;; ```\n{cursor}\n```
```

## 📦 Installation

### From Marketplace (Recommended)
1. Open Logseq
2. Go to Settings → Plugins → Marketplace
3. Search for "Logseq Snippets"
4. Click Install

### Manual Installation
1. Download `logseq-snippets-v0.2.1.zip`
2. Unzip the file
3. In Logseq, enable Developer Mode
4. Click "Load unpacked plugin" and select the unzipped folder

## 🐛 Bug Fixes

- Fixed version display in bump script (now shows old → new version)
- Improved notification system with three-option enum

## 📊 Bundle Information

- Main bundle: **105.47 KB** (34.48 KB gzipped)
- Dependencies: @logseq/libs ^0.0.17
- License: MIT

## 🔗 Links

- **Repository**: https://github.com/martinmoeller/logseq-snippets
- **Issues**: https://github.com/martinmoeller/logseq-snippets/issues
- **Documentation**: See README.md for full documentation

## 🙏 Credits

Built with love for the Logseq community.

**Author**: Martin Möller (@martinmoeller)
**Co-Authored-By**: Claude Sonnet 4.5

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for complete version history.
