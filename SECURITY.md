# Security

## Design

Full File Extensions is display-only. It does not access the network, persist settings, read note or attachment contents, or write to the vault. It performs a metadata-only file lookup when restoring native labels on unload.

The plugin observes only native File Explorer DOM roots and rewrites visible file labels from each item's existing `data-path` attribute. Its MutationObserver is disconnected on unload, and native basename labels are restored.

## Reporting an issue

Open a private GitHub security advisory in the repository where you publish this plugin. Avoid posting sensitive vault paths or note contents in public issues.
