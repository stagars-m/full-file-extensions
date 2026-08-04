/*
 * Full File Extensions 1.1.0
 * Generated from src/main.js with no external build dependencies.
 */
"use strict";

const { Plugin, PluginSettingTab, Setting, TFile } = require("obsidian");

const EXPLORER_SELECTOR = '.workspace-leaf-content[data-type="file-explorer"]';
const FILE_SELECTOR = ".nav-file-title[data-path]";
const CONTENT_SELECTOR = ".nav-file-title-content";
const OWNED_CLASS = "full-file-extensions-item";
const SPLIT_CLASS = "full-file-extensions-split";
const LABEL_CLASS = "full-file-extensions-label";
const NAME_CLASS = "full-file-extensions-name";
const EXTENSION_CLASS = "full-file-extensions-extension";

const DEFAULT_SETTINGS = Object.freeze({
  showFinalExtension: true,
  preserveExtensionless: true,
  treatDotfilesAsComplete: true,
  preserveRenameField: true,
  showTooltip: true,
});

class FullFileExtensionsPlugin extends Plugin {
  constructor(...args) {
    super(...args);
    this.observer = null;
    this.refreshFrame = null;
    this.settings = { ...DEFAULT_SETTINGS };
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

  static isDotfile(filename) {
    const value = String(filename ?? "");
    return value.length > 1 && value.startsWith(".");
  }

  static splitFinalExtension(filename, treatDotfilesAsComplete = true) {
    const value = String(filename ?? "");

    if (!value) {
      return { name: "", extension: "", hasExtension: false, isDotfile: false };
    }

    const isDotfile = FullFileExtensionsPlugin.isDotfile(value);
    if (isDotfile && treatDotfilesAsComplete) {
      return { name: value, extension: "", hasExtension: false, isDotfile: true };
    }

    const finalDot = value.lastIndexOf(".");
    const hasExtension = finalDot >= 0 && finalDot < value.length - 1;

    if (!hasExtension) {
      return { name: value, extension: "", hasExtension: false, isDotfile };
    }

    return {
      name: value.slice(0, finalDot),
      extension: value.slice(finalDot),
      hasExtension: true,
      isDotfile,
    };
  }

  static normalizeSettings(data) {
    const source = data && typeof data === "object" ? data : {};
    return {
      showFinalExtension: source.showFinalExtension !== false,
      preserveExtensionless: source.preserveExtensionless !== false,
      treatDotfilesAsComplete: source.treatDotfilesAsComplete !== false,
      preserveRenameField: source.preserveRenameField !== false,
      showTooltip: source.showTooltip !== false,
    };
  }

  async onload() {
    this.settings = FullFileExtensionsPlugin.normalizeSettings(await this.loadData());
    this.addSettingTab(new FullFileExtensionsSettingTab(this.app, this));

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

  async updateSetting(key, value) {
    this.settings[key] = value;
    await this.saveData(this.settings);
    this.restoreNativeLabels();
    this.connectExplorerObservers();
    this.scheduleRefresh();
  }

  connectExplorerObservers() {
    if (!this.observer) return;

    this.observer.disconnect();
    document.querySelectorAll(EXPLORER_SELECTOR).forEach((explorer) => {
      this.observer.observe(explorer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-path", "class"],
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
      .forEach((title) => this.applyPresentation(title));
  }

  applyPresentation(title) {
    if (!(title instanceof HTMLElement)) return;

    const path = title.dataset.path;
    if (!path) return;

    const filename = FullFileExtensionsPlugin.filenameFromPath(path);
    if (!filename) return;

    const isRenaming = Boolean(
      title.querySelector('input, textarea, [contenteditable="true"]'),
    );

    if (isRenaming) {
      if (this.settings.preserveRenameField) {
        this.clearPresentation(title, { restoreLabel: false });
      }
      return;
    }

    this.applyTooltip(title, filename);

    if (!this.settings.showFinalExtension) {
      this.restoreNativeLabel(title);
      return;
    }

    const content = title.querySelector(CONTENT_SELECTOR);
    if (!(content instanceof HTMLElement)) return;

    const parts = FullFileExtensionsPlugin.splitFinalExtension(
      filename,
      this.settings.treatDotfilesAsComplete,
    );

    const leaveAsNormal = !parts.hasExtension && this.settings.preserveExtensionless;
    if (leaveAsNormal) {
      this.renderSingleLabel(title, content, filename);
      return;
    }

    this.renderSplitLabel(title, content, parts.name, parts.extension);
  }

  renderSingleLabel(title, content, filename) {
    if (
      content.textContent !== filename ||
      content.classList.contains(LABEL_CLASS) ||
      content.querySelector(`.${NAME_CLASS}, .${EXTENSION_CLASS}`)
    ) {
      content.classList.remove(LABEL_CLASS);
      content.replaceChildren(document.createTextNode(filename));
    }

    title.classList.add(OWNED_CLASS);
    title.classList.remove(SPLIT_CLASS);
  }

  renderSplitLabel(title, content, name, extension) {
    const currentName = content.querySelector(`.${NAME_CLASS}`);
    const currentExtension = content.querySelector(`.${EXTENSION_CLASS}`);

    if (
      !(currentName instanceof HTMLElement) ||
      !(currentExtension instanceof HTMLElement) ||
      currentName.textContent !== name ||
      currentExtension.textContent !== extension
    ) {
      const nameEl = document.createElement("span");
      nameEl.className = NAME_CLASS;
      nameEl.textContent = name;

      const extensionEl = document.createElement("span");
      extensionEl.className = EXTENSION_CLASS;
      extensionEl.textContent = extension;
      extensionEl.setAttribute("aria-hidden", "true");

      content.replaceChildren(nameEl, extensionEl);
    }

    content.classList.add(LABEL_CLASS);
    title.classList.add(OWNED_CLASS, SPLIT_CLASS);
  }

  applyTooltip(title, filename) {
    if (!this.settings.showTooltip) {
      this.restoreTooltip(title);
      return;
    }

    if (title.dataset.ffeTooltipOwned !== "true") {
      title.dataset.ffeTooltipOwned = "true";
      title.dataset.ffeHadOriginalTitle = title.hasAttribute("title") ? "true" : "false";
      title.dataset.ffeOriginalTitle = title.getAttribute("title") ?? "";
    }

    if (title.getAttribute("title") !== filename) {
      title.setAttribute("title", filename);
    }
  }

  restoreTooltip(title) {
    if (title.dataset.ffeTooltipOwned !== "true") return;

    if (title.dataset.ffeHadOriginalTitle === "true") {
      title.setAttribute("title", title.dataset.ffeOriginalTitle ?? "");
    } else {
      title.removeAttribute("title");
    }

    delete title.dataset.ffeTooltipOwned;
    delete title.dataset.ffeHadOriginalTitle;
    delete title.dataset.ffeOriginalTitle;
  }

  restoreNativeLabel(title) {
    if (!(title instanceof HTMLElement)) return;

    const path = title.dataset.path;
    const content = title.querySelector(CONTENT_SELECTOR);
    if (!path || !(content instanceof HTMLElement)) return;

    const file = this.app.vault.getAbstractFileByPath(path);
    const filename = FullFileExtensionsPlugin.filenameFromPath(path);
    const nativeLabel = file instanceof TFile
      ? file.basename
      : FullFileExtensionsPlugin.nativeBasenameFallback(filename);

    if (content.textContent !== nativeLabel || content.classList.contains(LABEL_CLASS)) {
      content.classList.remove(LABEL_CLASS);
      content.replaceChildren(document.createTextNode(nativeLabel));
    }

    title.classList.remove(OWNED_CLASS, SPLIT_CLASS);
  }

  clearPresentation(title, { restoreLabel = true } = {}) {
    if (!(title instanceof HTMLElement)) return;

    if (restoreLabel) {
      this.restoreNativeLabel(title);
    } else {
      title.classList.remove(OWNED_CLASS, SPLIT_CLASS);
      const content = title.querySelector(CONTENT_SELECTOR);
      if (content instanceof HTMLElement) {
        content.classList.remove(LABEL_CLASS);
      }
    }

    this.restoreTooltip(title);
  }

  restoreNativeLabels() {
    document.querySelectorAll(`${EXPLORER_SELECTOR} ${FILE_SELECTOR}`).forEach((title) => {
      if (!(title instanceof HTMLElement)) return;

      const isRenaming = Boolean(
        title.querySelector('input, textarea, [contenteditable="true"]'),
      );

      this.clearPresentation(title, { restoreLabel: !isRenaming });
    });
  }
}

class FullFileExtensionsSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Full File Extensions" });

    new Setting(containerEl)
      .setName("Show the final extension")
      .setDesc("Pins the last extension, such as .md, .pdf, or .txt, to the right edge of each file row.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showFinalExtension)
          .onChange((value) => this.plugin.updateSetting("showFinalExtension", value)),
      );

    new Setting(containerEl)
      .setName("Treat filenames without an extension normally")
      .setDesc("Leaves names such as README as a normal unsplit label. When disabled, they use the aligned layout with an empty extension slot.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.preserveExtensionless)
          .onChange((value) => this.plugin.updateSetting("preserveExtensionless", value)),
      );

    new Setting(containerEl)
      .setName("Treat dotfiles as complete filenames")
      .setDesc("Keeps names such as .env and .gitignore together instead of treating the whole name as an extension.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.treatDotfilesAsComplete)
          .onChange((value) => this.plugin.updateSetting("treatDotfilesAsComplete", value)),
      );

    new Setting(containerEl)
      .setName("Preserve the normal rename field")
      .setDesc("Temporarily removes plugin formatting while Obsidian's inline rename editor is active. The plugin never edits the rename input itself.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.preserveRenameField)
          .onChange((value) => this.plugin.updateSetting("preserveRenameField", value)),
      );

    new Setting(containerEl)
      .setName("Show the complete filename on hover")
      .setDesc("Adds a native tooltip containing the full filename.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showTooltip)
          .onChange((value) => this.plugin.updateSetting("showTooltip", value)),
      );
  }
}

module.exports = FullFileExtensionsPlugin;
