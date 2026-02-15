# Release Guide for Logseq Marketplace

## Current Version: 0.2.1

## Pre-Release Checklist

### ✅ Code Quality
- [x] All TypeScript errors resolved
- [x] Build successful (105.47 KB, 34.48 KB gzipped)
- [x] ESLint configuration added
- [x] Prettier configuration added
- [x] All features tested locally

### ✅ Documentation
- [x] README.md complete with examples
- [x] CHANGELOG.md with version history
- [x] IMPROVEMENTS.md documenting all changes
- [x] LICENSE file (MIT)
- [x] package.json properly configured
- [x] Icon.svg included

### ✅ Repository
- [x] All changes committed
- [x] Changes pushed to GitHub
- [x] Repository is public
- [x] .gitignore properly configured

### 📸 TODO Before Marketplace Submission
- [ ] Add screenshots to README.md
  - Screenshot 1: Settings panel showing snippet configuration
  - Screenshot 2: Snippet expansion in action
  - Screenshot 3: Import/Export toolbar buttons
  - Screenshot 4: Notification example (optional)

### 🚀 GitHub Release Steps

1. **Create a GitHub Release**
   ```bash
   # Tag the release
   git tag v0.2.1
   git push origin v0.2.1
   ```

2. **Go to GitHub Releases**
   - Visit: https://github.com/martinmoeller/logseq-snippets/releases/new
   - Tag: v0.2.1
   - Title: "v0.2.1 - Major Feature Update"

3. **Release Notes** (copy from below):

---

## v0.2.1 - Major Feature Update

### 🎉 New Features

**Text Expansion Enhancements:**
- ✨ Multi-line snippet support using `\n` syntax
- 📅 Dynamic variables: `{date}`, `{time}`, `{datetime}`, `{clipboard}`
- 🎯 Cursor positioning with `{cursor}` marker
- 💬 Comment support using `#` prefix

**Customization:**
- 🔤 Case sensitivity option (on/off)
- 🔔 Configurable notifications (always/never/errors-only)
- 💾 Import/Export snippets via toolbar buttons

### 🔧 Technical Improvements

- ⚡ Performance optimization with snippet caching
- 🛡️ Full TypeScript strict mode compliance
- 🔒 Comprehensive error handling
- 🧹 Event listener cleanup (no memory leaks)
- 🌍 Unicode support for international characters
- ⚠️ Duplicate trigger detection and warnings

### 📚 Documentation

- Comprehensive README with examples and troubleshooting
- Complete CHANGELOG following Keep a Changelog format
- Developer tools: ESLint, Prettier, enhanced version bump script

### 📦 Installation

Install from Logseq Marketplace or download the release package.

### 🐛 Bug Fixes

- Fixed version display in bump script
- Improved notification system flexibility

### 💡 Example Snippets

```
# Quick text expansion
gh ;; GitHub
gm ;; Good Morning

# Dynamic content
today ;; {date}
now ;; {datetime}

# Multi-line templates
meeting ;; ## Meeting Notes\n- Date: {date}\n- Attendees: \n- Topics:
```

### 📊 Bundle Size

- Main bundle: 105.47 KB
- Gzipped: 34.48 KB

---

4. **Attach Release Files**
   - Upload the entire `dist` folder as a zip file
   - Name it: `logseq-snippets-v0.2.1.zip`

   ```bash
   cd dist
   zip -r ../logseq-snippets-v0.2.1.zip .
   cd ..
   ```

5. **Publish the Release**
   - Mark as "Latest release"
   - Click "Publish release"

### 📝 Logseq Marketplace Submission

1. **Fork the Logseq Marketplace Repository**
   - Repository: https://github.com/logseq/marketplace

2. **Add Your Plugin**
   - Navigate to `packages/` directory
   - Create a file: `logseq-snippets.json`

3. **Plugin Manifest** (example format):
   ```json
   {
     "id": "_pll250838",
     "title": "Logseq Snippets",
     "description": "Text expansion plugin with variables, multi-line support, and smart features",
     "author": "Martin Möller",
     "repo": "martinmoeller/logseq-snippets",
     "icon": "./icon.svg",
     "effect": true
   }
   ```

4. **Create Pull Request**
   - Title: "Add Logseq Snippets Plugin"
   - Description: Brief overview of plugin features
   - Link to your release

5. **Wait for Review**
   - Marketplace maintainers will review
   - Address any feedback
   - Plugin will be published once approved

## Post-Release

### Update Documentation
- [ ] Update README if screenshots were added
- [ ] Announce in Logseq Discord/Forum
- [ ] Consider creating a demo video

### Monitor
- [ ] Watch for issues on GitHub
- [ ] Respond to user feedback
- [ ] Plan next version improvements

## Quick Commands

```bash
# Build for release
npm run build

# Create release package
cd dist && zip -r ../logseq-snippets-v0.2.1.zip . && cd ..

# Create git tag
git tag v0.2.1
git push origin v0.2.1

# Install dependencies (if needed)
npm install
```

## Support Channels

- GitHub Issues: https://github.com/martinmoeller/logseq-snippets/issues
- Email: moellervdm@gmail.com
- Logseq Discord: #plugins channel

## Version Numbering

Following Semantic Versioning (semver):
- MAJOR version (x.0.0): Breaking changes
- MINOR version (0.x.0): New features, backward compatible
- PATCH version (0.0.x): Bug fixes, backward compatible

Current: 0.2.1 (Minor feature update with patch fixes)
