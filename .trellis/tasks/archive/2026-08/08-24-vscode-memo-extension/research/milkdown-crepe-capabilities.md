# Research: Milkdown and Crepe Capabilities

- Query: What does current Milkdown/Crepe provide natively for CommonMark/GFM task lists, Markdown serialization, slash commands, and block dragging, and which packages are required?
- Scope: external
- Date: 2026-08-24

## Findings

### Files found

- `.trellis/tasks/08-24-vscode-memo-extension/prd.md:28` — standard Markdown checklist syntax is the todo model.
- `.trellis/tasks/08-24-vscode-memo-extension/prd.md:30` — requires WYSIWYG block editing.
- `.trellis/tasks/08-24-vscode-memo-extension/prd.md:31` — requires Markdown shortcuts, slash insertion, and block dragging.
- No editor dependency is installed yet.

### Verified version and minimum package

The npm `latest` tag on 2026-08-24 is `@milkdown/crepe@7.22.1`. Install only `@milkdown/crepe@7.22.1` for the editor: it directly depends on matching `@milkdown/kit@7.22.1`, which in turn contains CommonMark, GFM, block, slash, listener, and serializer packages. Do not add separate top-level Milkdown packages unless implementation needs an API not exported by Crepe/kit.

Import at least:

```ts
import { Crepe } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
```

Add one Crepe theme or project CSS variables after the common stylesheet. Disable unrequested default features (`AI`, `TopBar` are already off; consider disabling image, table, math, and CodeMirror for the MVP) to reduce behavior and bundle size. Keep `ListItem` and `BlockEdit` enabled.

### Native capability mapping

| Product requirement                                                         | Crepe 7.22.1 support                                                                                                                                                |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CommonMark headings, paragraphs, lists, quotes, code blocks and input rules | Built into `CrepeBuilder` through the CommonMark preset.                                                                                                            |
| GFM checklist parse/serialize                                               | Built into `CrepeBuilder` through the GFM preset; the task-list schema owns the `checked` attribute and Markdown conversion.                                        |
| Clickable checklist                                                         | `Crepe.Feature.ListItem`, enabled by default, renders checked/unchecked list controls and updates editor state.                                                     |
| Markdown serialization                                                      | `crepe.getMarkdown()` and `crepe.on(listener => listener.markdownUpdated(...))`; the listener is already included and emits after a 200 ms debounce.                |
| Slash commands                                                              | `Crepe.Feature.BlockEdit`, enabled by default, includes a slash provider and menu entries for text, headings, quote, lists, task list, code, and optional features. |
| Block handle and drag reorder                                               | The same `BlockEdit` feature installs the block provider and draggable handle. No custom drag system is needed.                                                     |

Persist the `markdownUpdated` string through the typed webview message boundary. A direct checkbox click, slash insertion, and drag reorder all become ordinary document changes and therefore flow through the same serializer/listener path; do not implement separate checklist line rewriting.

### Serialization caveat

Milkdown is a semantic Markdown editor, not a byte-preserving source editor. Its serializer may normalize equivalent Markdown (the upstream 7.22.1 task-list round-trip test explicitly notes bullet markers normalize to `*`). The product should promise valid persisted Markdown and preserved checklist semantics, not preservation of the user's exact whitespace or bullet character.

Version 7.22.1 contains a regression test that preserves tight task-list checkbox syntax through serialization. Pin all Milkdown packages to one exact version because its packages are released in lockstep.

### External references

- [Crepe package 7.22.1](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/crepe/package.json) — package version, exports, dependencies, and theme paths.
- [Crepe builder 7.22.1](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/crepe/src/core/builder.ts) — CommonMark, GFM, listener, `getMarkdown`, and listener API are built in.
- [Crepe feature flags](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/crepe/src/feature/index.ts) — `ListItem` and `BlockEdit` defaults and capability descriptions.
- [Crepe BlockEdit implementation](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/crepe/src/feature/block-edit/index.ts) — installs block and slash/menu plugins.
- [Default slash menu](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/crepe/src/feature/block-edit/menu/config.ts) — task list and supported block entries.
- [GFM task-list schema](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/plugins/preset-gfm/src/node/task-list-item.ts) — parse, serialize, and input-rule behavior.
- [Task-list round-trip regression](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/plugins/preset-gfm/src/__test__/task-list-spread-roundtrip.spec.ts) — checkbox preservation and bullet normalization.
- [Milkdown documentation: using Crepe](https://milkdown.dev/docs/guide/using-crepe) — public installation path.

## Related specs

- `.trellis/spec/frontend/component-guidelines.md` (currently a placeholder)
- `.trellis/spec/frontend/state-management.md` (currently a placeholder)
- `.trellis/spec/frontend/quality-guidelines.md` (currently a placeholder)

## Caveats / Not Found

- Crepe includes Vue internally; choosing vanilla Crepe does not require the extension project itself to adopt Vue.
- Real Webview CSP compatibility must be exercised in the Extension Development Host because BlockEdit uses runtime inline positioning styles.
- Exact-source Markdown preservation is not supported and should not become an acceptance criterion.
