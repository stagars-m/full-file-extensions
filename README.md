# Full File Extensions

A minimal Obsidian plugin that keeps the final file extension visible in the native File Explorer. The extension sits directly beside a short filename. When space is limited, only the filename stem shortens with an ellipsis and the extension remains visible.

Examples:

```text
A very long research document about payments….md
Quarterly banking statistics.pdf
archive.tar.gz
```

## Settings

All settings are enabled by default:

- **Show the final extension**: keeps the last extension, such as `.md`, `.pdf`, or `.txt`, visible beside the filename.
- **Shade file extension**: displays the extension in a lighter muted color. Disable it to use the normal filename color.
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
- Stores only six local boolean preferences through Obsidian's plugin settings storage

It reads the native File Explorer's existing `data-path` attributes and changes display markup only. Disabling the plugin restores Obsidian's native labels.

## Install with BRAT

1. Update the GitHub repository `full-file-extensions` with the contents of this package.
2. Create a new release tagged `1.1.2`.
3. Attach these files individually:
   - `main.js`
   - `manifest.json`
   - `styles.css`
4. Keep the release tag and manifest version at `1.1.2`.
5. Update through BRAT and enable **Full File Extensions** under Community plugins.

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
