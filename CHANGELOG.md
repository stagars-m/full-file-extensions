# Changelog

## 1.1.3

- Remove every `!important` declaration from `styles.css`.
- Use specific plugin-owned File Explorer selectors to preserve adjacent extension layout without forced declarations.
- Shade extensions at `0.5` opacity while inheriting the filename font size and typography.
- Move the build script, source entrypoint, and test entrypoint to the repository root.
- Make `npm run build` use `node build.mjs` so clean build verification does not depend on a missing `scripts/` directory.
- Keep filename splitting, truncation, tooltip, dotfile, extensionless-file, rename, and settings behavior unchanged from 1.1.2.

## 1.1.2

- Add a **Shade file extension** setting, enabled by default.
- Let users switch extensions between muted gray and the normal filename color.
- Keep extension positioning, truncation, tooltips, dotfile handling, and rename behavior unchanged.

## 1.1.1

- Keep the extension directly beside filenames that fit without truncation.
- Preserve the extension immediately after the ellipsized stem for long filenames.
- Remove the unnecessary gap that appeared between short filenames and extensions.
- Override theme-level spacing that could push the extension to the right edge.
- Shrink-wrap short labels while allowing long labels to use the available width.
- Add regression checks for label width, spacing, and extension margin overrides.

## 1.1.0

- Pin the final extension to the right edge of each File Explorer row.
- Truncate only the filename stem with an ellipsis.
- Add five local settings for extension display, extensionless files, dotfiles, rename behavior, and tooltips.
- Preserve native labels when the display feature is disabled.

## 1.0.0

- Initial release showing complete filenames in the native File Explorer.
