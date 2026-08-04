"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");

const root = __dirname;
const originalLoad = Module._load;
Module._load = function mockedLoad(request, parent, isMain) {
  if (request === "obsidian") {
    return {
      Plugin: class Plugin {},
      PluginSettingTab: class PluginSettingTab {},
      Setting: class Setting {},
      TFile: class TFile {},
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const PluginClass = require(path.join(root, "main.js"));
Module._load = originalLoad;

test("extracts complete filenames from vault and Windows paths", () => {
  assert.equal(PluginClass.filenameFromPath("Folder/Signal.md"), "Signal.md");
  assert.equal(PluginClass.filenameFromPath("Folder\\report.pdf"), "report.pdf");
  assert.equal(PluginClass.filenameFromPath("archive.tar.gz"), "archive.tar.gz");
  assert.equal(PluginClass.filenameFromPath(""), "");
});

test("native fallback removes only the final extension", () => {
  assert.equal(PluginClass.nativeBasenameFallback("Signal.md"), "Signal");
  assert.equal(PluginClass.nativeBasenameFallback("archive.tar.gz"), "archive.tar");
  assert.equal(PluginClass.nativeBasenameFallback(".env"), ".env");
  assert.equal(PluginClass.nativeBasenameFallback("README"), "README");
});

test("splits only the final extension", () => {
  assert.deepEqual(PluginClass.splitFinalExtension("Signal.md"), {
    name: "Signal",
    extension: ".md",
    hasExtension: true,
    isDotfile: false,
  });
  assert.deepEqual(PluginClass.splitFinalExtension("archive.tar.gz"), {
    name: "archive.tar",
    extension: ".gz",
    hasExtension: true,
    isDotfile: false,
  });
});

test("preserves extensionless names and dotfiles by default", () => {
  assert.deepEqual(PluginClass.splitFinalExtension("README"), {
    name: "README",
    extension: "",
    hasExtension: false,
    isDotfile: false,
  });
  assert.deepEqual(PluginClass.splitFinalExtension(".env"), {
    name: ".env",
    extension: "",
    hasExtension: false,
    isDotfile: true,
  });
});

test("can treat a dotfile as an extension", () => {
  assert.deepEqual(PluginClass.splitFinalExtension(".env", false), {
    name: "",
    extension: ".env",
    hasExtension: true,
    isDotfile: true,
  });
});

test("normalizes missing and partial settings safely", () => {
  assert.deepEqual(PluginClass.normalizeSettings(null), {
    showFinalExtension: true,
    preserveExtensionless: true,
    treatDotfilesAsComplete: true,
    preserveRenameField: true,
    showTooltip: true,
    shadeExtension: true,
  });
  assert.equal(PluginClass.normalizeSettings({ showTooltip: false }).showTooltip, false);
  assert.equal(PluginClass.normalizeSettings({ showTooltip: false }).showFinalExtension, true);
  assert.equal(PluginClass.normalizeSettings({ shadeExtension: false }).shadeExtension, false);
});

test("CSS contains no important declarations", () => {
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.doesNotMatch(css, /!important/i);
});

test("CSS keeps extensions adjacent using plugin-owned specificity", () => {
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.match(css, /workspace-leaf-content\[data-type="file-explorer"\][\s\S]*full-file-extensions-item\.full-file-extensions-split/);
  assert.match(css, /justify-content:\s*flex-start/);
  assert.match(css, /gap:\s*0/);
  assert.match(css, /flex:\s*0 1 auto/);
  assert.match(css, /width:\s*fit-content/);
  assert.match(css, /full-file-extensions-extension[\s\S]*margin:\s*0/);
  assert.doesNotMatch(css, /^\s*width:\s*100%/m);
  assert.doesNotMatch(css, /margin-left:\s*auto/);
  assert.doesNotMatch(css, /justify-content:\s*space-between/);
});

test("CSS shades extensions at 0.5 opacity and keeps filename typography", () => {
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.match(css, /full-file-extensions-extension[\s\S]*font-size:\s*inherit/);
  assert.match(css, /full-file-extensions-extension[\s\S]*line-height:\s*inherit/);
  assert.match(css, /full-file-extensions-shaded[\s\S]*opacity:\s*0\.5/);
});

test("clean build uses only root-level build-critical files", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const build = fs.readFileSync(path.join(root, "build.mjs"), "utf8");
  assert.equal(pkg.scripts.build, "node build.mjs");
  assert.equal(pkg.scripts.test, "node --test test.cjs");
  assert.ok(fs.existsSync(path.join(root, "build.mjs")));
  assert.ok(fs.existsSync(path.join(root, "main.ts")));
  assert.ok(fs.existsSync(path.join(root, "test.cjs")));
  assert.doesNotMatch(build, /scripts\//);
  assert.doesNotMatch(build, /src\//);
  assert.match(build, /\.\/main\.ts/);
});

test("all release metadata uses version 1.1.3", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
  const versions = JSON.parse(fs.readFileSync(path.join(root, "versions.json"), "utf8"));
  const main = fs.readFileSync(path.join(root, "main.js"), "utf8");
  assert.equal(pkg.version, "1.1.3");
  assert.equal(lock.version, "1.1.3");
  assert.equal(lock.packages[""].version, "1.1.3");
  assert.equal(manifest.version, "1.1.3");
  assert.equal(versions["1.1.3"], manifest.minAppVersion);
  assert.match(main, /Full File Extensions 1\.1\.3/);
});

test("runtime remains free of network, Node, Electron, and vault-write APIs", () => {
  const runtime = fs.readFileSync(path.join(root, "main.ts"), "utf8");
  const prohibited = [
    /\bfetch\s*\(/,
    /XMLHttpRequest/,
    /WebSocket/,
    /require\(["'](?:fs|node:fs|electron|child_process|node:child_process)["']\)/,
    /app\.vault\.(?:create|createBinary|modify|modifyBinary|delete|trash|rename|copy)\s*\(/,
  ];
  for (const pattern of prohibited) assert.doesNotMatch(runtime, pattern);
});
