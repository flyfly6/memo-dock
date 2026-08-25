# Research: BlockNote 0.54.0 for the Memo Dock Webview

- Date: 2026-08-24
- Decision candidate: replace Milkdown Crepe with BlockNote 0.54.0

## Verified Fit

- BlockNote is a React block editor built on ProseMirror and Tiptap.
- Its default React UI includes a slash menu and a side menu with block insertion and drag reordering.
- The editor can parse Markdown with `tryParseMarkdownToBlocks` and export with `blocksToMarkdownLossy`.
- The open-source core, React, and standard UI packages are MPL-2.0. Do not use `@blocknote/xl-*`, which uses GPL-3.0 or requires a commercial license.

## Required Boundary

Markdown export is explicitly lossy. Memo Dock must restrict the editor schema and insertion menu to the accepted Markdown-compatible blocks: paragraphs, headings, lists, checklist items, quotes, and code blocks. It must not promise byte-preserving Markdown or expose unsupported rich blocks whose semantics cannot survive export.

Use React only inside the webview bundle. The extension host remains framework-free. Apply VS Code theme variables through project CSS instead of shipping BlockNote's bundled Inter font. Webview scripts remain nonce-only; runtime editor UI may require inline styles, but must not require `unsafe-eval`.

On 2026-08-24, npm resolved BlockNote's `^3.29.2` Tiptap ranges to `@tiptap/extensions@3.30.3`, whose exact `@tiptap/pm@3.30.3` dependency was not published. Pin the Tiptap packages used by BlockNote to the complete `3.30.2` release line until the upstream release is consistent.

## References

- [BlockNote repository](https://github.com/TypeCellOS/BlockNote)
- [Getting started](https://www.blocknotejs.org/docs/getting-started)
- [Block side menu](https://www.blocknotejs.org/docs/react/components/side-menu)
- [Markdown import](https://www.blocknotejs.org/docs/features/import/markdown)
- [Markdown export](https://www.blocknotejs.org/docs/features/export/markdown)
