# Logseq Snippets Plugin

A simple and effective text expansion plugin for Logseq.

## Features

-   **Text Expansion**: Automatically expands keywords into longer text strings.
-   **Configurable**: Manage your snippets directly in Logseq settings (Settings > Plugin Settings > Logseq Snippets).
-   **Simple Format**: Define snippets one per line using `trigger ;; replacement` syntax.

## Usage

1.  Open **Settings > Plugin Settings > Logseq Snippets**.
2.  Add your snippets in the text area. Example:
    ```
    gh ;; GitHub
    gm ;; Good Morning
    logseq ;; Logseq is awesome!
    ```
3.  Type `gh` followed by a space or enter key in any block, and it will expand to `GitHub`.

![Demo](https://raw.githubusercontent.com/martinmoeller/logseq-snippets/main/demo.gif)

## Installation

### Marketplace

1.  Click on the 3 dots in the top right corner.
2.  Go to **Settings > Advanced**.
3.  Ensure **Plug-in system** is enabled.
4.  Go to **Plugins > Marketplace**.
5.  Search for "Logseq Snippets".
6.  Click **Install**.

### Manual

1.  Download the latest release.
2.  Unzip the file.
3.  In Logseq, turn on Developer Mode.
4.  Click "Load unpacked plugin" and select the unzipped folder.

## Configuration

The plugin is configured via the Logseq plugin settings.

-   **Snippets**: A JSON-like or custom format list of triggers and replacements.
    -   Format: `trigger ;; replacement`

## Author

Martin Möller <moellervdm@gmail.com>

## License

MIT
