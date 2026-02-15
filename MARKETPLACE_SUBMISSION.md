# Marketplace Submission Instructions

## ✅ Vorbereitung abgeschlossen

Alle Dateien für die Marketplace-Submission sind bereit:
- ✅ Manifest erstellt
- ✅ Icon kopiert
- ✅ Branch erstellt: `add-logseq-snippets`
- ✅ Commit vorbereitet

## 📋 Nächste Schritte

### 1. Fork das Marketplace-Repository

1. Gehe zu: https://github.com/logseq/marketplace
2. Klicke auf **Fork** (oben rechts)
3. Erstelle den Fork in deinem GitHub Account (@martinmoeller)

### 2. Push zu deinem Fork

Nach dem Forken:

```bash
cd /c/Users/pfrmo/OneDrive/Dokumente/GitHub/logseq-marketplace

# Füge deinen Fork als Remote hinzu
git remote add myfork https://github.com/martinmoeller/marketplace.git

# Push den Branch zu deinem Fork
git push myfork add-logseq-snippets
```

### 3. Erstelle den Pull Request

1. Gehe zu: https://github.com/martinmoeller/marketplace
2. Du siehst einen Banner "Compare & pull request" - klicke darauf
3. **Title**: `Add Logseq Snippets Plugin`
4. **Description**: Kopiere folgenden Text:

```markdown
# Add Logseq Snippets Plugin

A powerful text expansion plugin for Logseq with advanced features.

## Plugin Information

- **Name**: Logseq Snippets
- **Author**: Martin Möller (@martinmoeller)
- **Repository**: https://github.com/martinmoeller/logseq-snippets
- **Version**: 0.2.1
- **License**: MIT

## Features

### Core Functionality
- ✨ **Smart text expansion** - Type a trigger followed by space, punctuation, or Enter
- 📝 **Multi-line snippets** - Use `\n` to create complex templates
- 📅 **Dynamic variables** - Insert `{date}`, `{time}`, `{datetime}`, `{clipboard}`
- 🎯 **Cursor positioning** - Use `{cursor}` marker for precise placement

### Customization
- 🔤 **Case sensitivity** - Optional case-sensitive or case-insensitive matching
- 💾 **Import/Export** - Share snippet collections via toolbar buttons
- 🔔 **Configurable notifications** - Choose always / never / errors-only
- 💬 **Comments** - Organize snippets with `#` prefix

### Technical
- ⚡ **Performance optimization** - Smart caching for instant expansion
- 🛡️ **TypeScript strict mode** - Full type safety
- 🌍 **Unicode support** - Works with international characters
- ⚠️ **Duplicate detection** - Warns about conflicting triggers

## Testing

The plugin has been:
- ✅ Built and tested successfully
- ✅ Used in production environment
- ✅ Fully documented with README, CHANGELOG, and examples
- ✅ Released with tag v0.2.1

## Screenshots

![Logseq Snippets Settings](https://raw.githubusercontent.com/martinmoeller/logseq-snippets/master/screenshots/screenshot.png)

## Links

- **Repository**: https://github.com/martinmoeller/logseq-snippets
- **Release**: https://github.com/martinmoeller/logseq-snippets/releases/tag/v0.2.1
- **Documentation**: https://github.com/martinmoeller/logseq-snippets#readme
```

5. Klicke **Create pull request**

## 📂 Dateien im Marketplace

Das Plugin wurde hier hinzugefügt:
```
packages/logseq-snippets/
├── manifest.json
└── icon.svg
```

**manifest.json**:
```json
{
  "title": "Logseq Snippets",
  "description": "A powerful text expansion plugin with dynamic variables, multi-line support, and smart features. Transform short triggers into longer text with {date}, {time}, {clipboard} variables, import/export, and customizable behavior.",
  "author": "Martin Möller",
  "repo": "martinmoeller/logseq-snippets",
  "icon": "icon.svg",
  "theme": false
}
```

## ⏳ Nach dem Pull Request

1. **Warten auf Review** - Die Marketplace-Maintainer werden deinen PR prüfen
2. **Feedback** - Antworte auf eventuelle Fragen oder Änderungswünsche
3. **Merge** - Nach Approval wird der PR gemerged
4. **Verfügbar** - Das Plugin erscheint im Logseq Marketplace

Normalerweise dauert die Review 1-7 Tage.

## 🔗 Hilfreiche Links

- Logseq Marketplace: https://github.com/logseq/marketplace
- Dein Plugin Repo: https://github.com/martinmoeller/logseq-snippets
- Logseq Discord: https://discord.gg/logseq (Kanal: #plugins)

---

Viel Erfolg mit der Submission! 🚀
