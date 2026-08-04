# Full File Extensions

A minimal Obsidian plugin that keeps the final file extension visible at the right edge of each row in the native File Explorer. The filename stem uses the remaining width and shortens with an ellipsis when necessary.

Examples:

```text
A very long research document about paym…   .md
Quarterly banking statistics                .pdf
archive.tar                                  .gz
```

## Settings

All settings are enabled by default:

- **Show the final extension**: pins the last extension, such as `.md`, `.pdf`, or `.txt`, to the right edge.
- **Treat filenames without an extension normally**: leaves names such as `README` as normal unsplit labels. When disabled, they use the aligned layout with an empty extension slot.
- **Treat dotfiles as complete filenames**: keeps `.env` and `.gitignore` together.
- **Preserve the normal rename field**: removes plugin formatting while Obsidian's inline rename editor is active. The plugin never edits the input.
- **Show the complete filename on hover**: adds a native tooltip with the full filename.

## Security and privacy

The plugin is intentionally narrow:

- No network access
- No telemetry
- No note-content or file-content reads
- No vault file writes
- No Node.js or Electron APIs
- No dynamic code execution
- No runtime dependencies
- Stores only five local boolean preferences through Obsidian's plugin settings storage

It reads the native File Explorer's existing `data-path` attributes and changes display markup only. Disabling the plugin restores Obsidian's native labels.

## Install with BRAT

1. Create or update the GitHub repository `full-file-extensions`.
2. Upload the contents of this repository package.
3. Create a GitHub release tagged exactly `1.1.0`.
4. Attach these three files individually:
   - `main.js`
   - `manifest.json`
   - `styles.css`
5. In Obsidian, run **BRAT: Check for updates to all beta plugins**, or add the repository URL if it is not installed.
6. Enable **Full File Extensions** under Community plugins.

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

Reload Obsidian, then enable the plugin.

## Scope and compatibility

The plugin targets Obsidian's native File Explorer. It does not modify alternative explorer views supplied by other plugins.

The File Explorer DOM classes and `data-path` attribute are not part of Obsidian's public plugin API. A future Obsidian interface change may require a selector update. The plugin does not patch Obsidian internals.

## Build and verify

Requires Node.js 18 or newer. The project has no npm dependencies.

```bash
npm run check
```

## License

MIT
