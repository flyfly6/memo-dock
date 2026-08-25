# Technical Design

## Architecture

Memo Dock uses two runtime boundaries bundled separately with esbuild:

- **Extension host**: activation, `WebviewViewProvider`, validated message dispatch, profile-local file persistence, native snippet editor integration, and clipboard access.
- **Webview**: a React two-tab UI, search, Markdown document management, and the BlockNote editor.
- **Shared contract**: dependency-free TypeScript discriminated unions and data types imported by both bundles.

The extension contributes one Activity Bar container and one webview view. React is confined to the browser bundle because BlockNote's supported UI integration is React-based; the extension host remains framework-free.

## Storage Contract

Use `ExtensionContext.globalStorageUri` with URI-based `vscode.workspace.fs` operations:

```text
globalStorageUri/
  index.json
  markdown/<id>.md
  snippets/<id>.txt
```

`index.json` stores id, kind, title, optional language id, and timestamps. Bodies remain plain files and are the search source of truth. IDs come from `crypto.randomUUID()` and are the only filename input. Write a body before its metadata record; on load, skip missing indexed bodies and ignore orphan files rather than adding a migration framework.

Snippet files use `.txt`; when opening one, apply its stored VS Code language id with `languages.setTextDocumentLanguage`, falling back to plaintext for an unavailable id. A single `onDidSaveTextDocument` listener refreshes sidebar metadata after managed snippet saves.

## Webview Contract

The webview sends intent messages such as create, save, delete, open, copy, and search. The extension host accepts `unknown`, validates a discriminated union, performs persistence, then sends serializable snapshots or operation errors back. The webview never receives `globalStorageUri` and cannot issue arbitrary paths.

The provider restricts `localResourceRoots` to bundled extension assets. HTML uses a fresh cryptographic nonce, `default-src 'none'`, nonce-only scripts, and VS Code resource origins. BlockNote UI positioning may require inline styles, so styles permit `'unsafe-inline'`; scripts never permit `'unsafe-inline'` or `'unsafe-eval'`.

## Markdown Editor

Pin BlockNote packages to the compatible `0.54.0` line and use the MPL-2.0 core, React, and standard UI packages only. BlockNote natively supplies the slash menu, side-menu block handle, drag reorder, checklist interaction, and change events required by the product.

BlockNote's Markdown conversion is officially lossy. Restrict the schema and insertion UI to the accepted Markdown-compatible blocks: paragraphs, headings, lists, checklists, quotes, and code blocks. Persist `blocksToMarkdownLossy` output and restore with `tryParseMarkdownToBlocks`; do not expose tables, files, diagrams, colors, or other structures whose semantics are outside the PRD. Use one debounced change-to-Markdown save path for typing, checkbox clicks, slash insertion, and drag reorder.

## Sidebar Design

Use a refined editorial-notebook direction adapted to VS Code rather than a generic card dashboard:

- compact Markdown/Snippet tabs, one quiet search field, and a focused document list/editor split within the narrow sidebar;
- VS Code foreground, background, input, focus, button, and high-contrast variables as the color system;
- restrained borders and spacing, visible keyboard focus, accessible labels, and no external fonts or decorative animation dependency;
- webview local state only for selected tab, active item, and search query; persisted content always comes from the extension host;
- project CSS adapts BlockNote to VS Code variables and editor fonts instead of bundling the optional Inter font.

## Tooling and Compatibility

- npm with a committed lockfile.
- TypeScript and React with separate node and browser concerns.
- esbuild bundles `src/extension.ts` as node/CommonJS with `vscode` external, and `src/webview/index.ts` as a browser bundle with CSS.
- `engines.vscode` targets the profile-aware `^1.117.0` line. npm does not publish `@types/vscode@1.117.0`, so type-check against the nearest lower declaration set, `1.116.0`; the APIs used by this task are present there.
- ESLint flat config, Prettier, `tsc --noEmit`, and Node built-in test/assert for pure logic. Add VS Code integration tooling only for the smallest host-boundary smoke test that cannot be checked otherwise.

## Trellis Configuration

Keep `session_auto_commit` at its default by leaving it unset. After the implementation establishes real patterns, populate frontend specs from the webview and backend specs from the extension host/storage boundary. Do not write aspirational examples before code exists.

## Rollback

Product initialization is additive. Before any commit, rollback is removing the newly created extension files and reverting the targeted Trellis config/spec/task edits. Profile data is runtime-created and is not touched by repository rollback.
