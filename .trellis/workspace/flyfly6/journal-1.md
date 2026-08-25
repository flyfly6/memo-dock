# Journal - flyfly6 (Part 1)

> AI development session journal
> Started: 2026-08-24

---



## Session 1: 初始化 Memo Dock VS Code 扩展

**Date**: 2026-08-25
**Task**: 初始化 Memo Dock VS Code 扩展
**Branch**: `main`

### Summary

完成 Profile 全局 Markdown 与 Snippet 侧栏扩展、BlockNote 编辑、原生 Snippet 编辑器、文件持久化、安全边界、定向测试及 Trellis 规范配置。

### Git Commits

| Hash | Message |
|------|---------|
| `597dc4e` | (see git log) |

### Status

[OK] **Completed**


## Session 2: 完成 Trellis 规范引导

**Date**: 2026-08-25
**Task**: 完成 Trellis 规范引导
**Branch**: `main`

### Summary

复核后端与前端 Trellis 规范，定向检查全部通过，并归档 bootstrap guidelines 任务。

### Git Commits

| Hash | Message |
|------|---------|
| `597dc4e` | (see git log) |

### Status

[OK] **Completed**


## Session 3: Plugin development and release workflow

**Date**: 2026-08-25
**Task**: Plugin development and release workflow
**Branch**: `main`

### Summary

Added DLP-safe watch builds, VSCE packaging and publishing scripts, clean VSIX contents, MIT licensing, and project verification guidance.

### Main Changes

- Added dev, package, and publish npm scripts with pinned VSCE tooling.
- Made esbuild work with enterprise DLP and BlockNote CSS exports.
- Added MIT licensing and release-package exclusions.

### Git Commits

(No commits - planning session)

### Testing

- [OK] VSIX package succeeded with 9 expected files and no license warning.
- [OK] Prettier, ESLint, TypeScript, Node tests, and git diff checks passed.

### Status

[OK] **Completed**


## Session 4: Markdown editor page

**Date**: 2026-08-25
**Task**: Markdown editor page
**Branch**: `main`

### Summary

Simplified Markdown into a singleton editor, redesigned the Mantine-based UI, retained only the BlockNote drag handle, and added an extensionHost watch launch configuration.

### Git Commits

| Hash | Message |
|------|---------|
| `0dd8302` | (see git log) |
| `f9fb9ad` | (see git log) |

### Status

[OK] **Completed**
