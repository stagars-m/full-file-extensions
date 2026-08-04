# BRAT release setup

This corrected package intentionally remains version `1.1.1`.

To replace the existing `1.1.1` release:

1. Commit the updated repository contents to the default branch.
2. Open the existing GitHub release tagged `1.1.1` and choose **Edit**.
3. Delete its existing `main.js`, `manifest.json`, and `styles.css` assets.
4. Upload the corrected files with those exact names from the release-assets package.
5. Save the release without changing the tag.
6. Remove and reinstall the plugin through BRAT, or delete the local plugin folder before reinstalling, because the version number is unchanged.
7. Confirm the installed `manifest.json` still shows version `1.1.1` and the corrected `styles.css` contains `width: fit-content !important`.

The tag and `manifest.json` version must both remain `1.1.1`.
