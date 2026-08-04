/*
 * Full File Extensions 1.0.0
 * Generated from src/main.js with no external build dependencies.
 */
"use strict";

const { Plugin, TFile } = require("obsidian");

const EXPLORER_SELECTOR = '.workspace-leaf-content[data-type="file-explorer"]';
const FILE_SELECTOR = ".nav-file-title[data-path]";
const CONTENT_SELECTOR = ".nav-file-title-content";
const OWNED_CLASS = "full-file-extensions-item";

class FullFileExtensionsPlugin extends Plugin {
  constructor(...args) {
    super(...args);
    this.observer = null;
    this.refreshFrame = null;
  }

  static filenameFromPath(path) {
    const normalized = String(path ?? "").replaceAll("\\", "/");
    const parts = normalized.split("/").filter((part) => part.length > 0);
    return parts.at(-1) ?? "";
  }

  static nativeBasenameFallback(filename) {
    const value = String(filename ?? "");
    const finalDot = value.lastIndexOf(".");
    return finalDot > 0 ? value.slice(0, finalDot) : value;
  }

  onload() {
    this.observer = new MutationObserver(() => this.scheduleRefresh());

    this.register(() => {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      if (this.refreshFrame !== null) {
        window.cancelAnimationFrame(this.refreshFrame);
        this.refreshFrame = null;
      }

      this.restoreNativeLabels();
    });

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.connectExplorerObservers();
        this.scheduleRefresh();
      }),
    );

    this.registerEvent(this.app.vault.on("create", () => this.scheduleRefresh()));
    this.registerEvent(this.app.vault.on("rename", () => this.scheduleRefresh()));
    this.registerEvent(this.app.vault.on("delete", () => this.scheduleRefresh()));

    this.addCommand({
      id: "refresh-full-file-extensions",
      name: "Refresh file name labels",
      callback: () => {
        this.connectExplorerObservers();
        this.refreshAllLabels();
      },
    });

    this.app.workspace.onLayoutReady(() => {
      this.connectExplorerObservers();
      this.refreshAllLabels();
    });
  }

  connectExplorerObservers() {
    if (!this.observer) return;

    this.observer.disconnect();
    document.querySelectorAll(EXPLORER_SELECTOR).forEach((explorer) => {
      this.observer.observe(explorer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-path"],
      });
    });
  }

  scheduleRefresh() {
    if (this.refreshFrame !== null) return;

    this.refreshFrame = window.requestAnimationFrame(() => {
      this.refreshFrame = null;
      this.refreshAllLabels();
    });
  }

  refreshAllLabels() {
    document
      .querySelectorAll(`${EXPLORER_SELECTOR} ${FILE_SELECTOR}`)
      .forEach((title) => this.applyFullFilename(title));
  }

  applyFullFilename(title) {
    if (!(title instanceof HTMLElement)) return;
    if (title.querySelector('input, textarea, [contenteditable="true"]')) return;

    const path = title.dataset.path;
    if (!path) return;

    const filename = FullFileExtensionsPlugin.filenameFromPath(path);
    if (!filename) return;

    const content = title.querySelector(CONTENT_SELECTOR);
    if (!(content instanceof HTMLElement)) return;

    if (content.textContent !== filename) {
      content.textContent = filename;
    }

    title.classList.add(OWNED_CLASS);
  }

  restoreNativeLabels() {
    document.querySelectorAll(`.${OWNED_CLASS}`).forEach((title) => {
      if (!(title instanceof HTMLElement)) return;

      const path = title.dataset.path;
      const content = title.querySelector(CONTENT_SELECTOR);

      if (
        path &&
        content instanceof HTMLElement &&
        !title.querySelector('input, textarea, [contenteditable="true"]')
      ) {
        const file = this.app.vault.getAbstractFileByPath(path);
        const filename = FullFileExtensionsPlugin.filenameFromPath(path);
        content.textContent = file instanceof TFile
          ? file.basename
          : FullFileExtensionsPlugin.nativeBasenameFallback(filename);
      }

      title.classList.remove(OWNED_CLASS);
    });
  }
}

module.exports = FullFileExtensionsPlugin;
