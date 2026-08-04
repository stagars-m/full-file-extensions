# Security

Full File Extensions has no network access, telemetry, remote code, runtime dependencies, or vault file writes.

The plugin reads only the existing `data-path` values rendered by Obsidian's native File Explorer. It changes display markup and optional native tooltip attributes. It never reads note or attachment contents and never modifies the inline rename input.

The plugin stores five boolean display preferences using Obsidian's standard plugin settings storage.

Report security issues privately through the repository owner's preferred GitHub contact method.
