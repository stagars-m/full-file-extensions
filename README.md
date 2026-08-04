# Full File Extensions

A minimal Obsidian plugin that shows complete filenames in the native File Explorer:

- `Signal.md`
- `report.pdf`
- `settings.yaml`
- `archive.tar.gz`

Obsidian's separate extension badge is hidden while the plugin is enabled, avoiding duplicate labels such as `report.pdf  pdf`.

## Security and privacy

The plugin is intentionally narrow:

- No network access
- No telemetry
- No note-content or file-content reads
- No vault writes
- No settings or stored data
- No Node.js or Electron APIs
- No dynamic code execution
- No runtime dependencies

It only reads the native File Explorer's existing `data-path` attributes and changes the displayed labels. Disabling the plugin restores Obsidian's native basename labels.

## Install with BRAT

BRAT installs plugins from GitHub releases. To use this package:

1. Create a GitHub repository, for example `full-file-extensions`.
2. Upload the contents of this folder to the repository.
3. Create a GitHub release tagged exactly `1.0.0`.
4. Attach these three files to the release:
   - `main.js`
   - `manifest.json`
   - `styles.css`
5. In Obsidian, install and enable **BRAT**.
6. Run **BRAT: Add a beta plugin for testing**.
7. Enter your GitHub repository URL.
8. Enable **Full File Extensions** under Community plugins.

BRAT's current release-based flow downloads `manifest.json`, `main.js`, and `styles.css` from the GitHub release assets.

## Manual install

Copy these files into:

```text
<Your Vault>/.obsidian/plugins/full-file-extensions/
```

Required files:

```text
main.js
manifest.json
styles.css
```

Reload Obsidian, then enable **Full File Extensions** under Community plugins.

## Usage

Enable the plugin. Existing and newly rendered entries in the native File Explorer will display their full filenames.

A command is also available:

```text
Full File Extensions: Refresh file name labels
```

Use it if a theme or another plugin rebuilds the File Explorer in an unusual way.

## Scope and compatibility

The plugin targets Obsidian's native File Explorer. It does not modify alternative explorer views supplied by other plugins.

The native explorer's DOM classes and `data-path` attribute are not part of Obsidian's public plugin API. A future Obsidian interface change may require a small selector update. The plugin does not patch Obsidian internals.

## Build and verify

Requires Node.js 18 or newer. The project has no npm dependencies.

```bash
npm run check
```

`npm run check` runs the unit tests, regenerates `main.js` from the readable source, and performs a JavaScript syntax check.

## Publishing note

Before publishing publicly, replace the placeholder author in `manifest.json` with your preferred name or organization.

## License

MIT
