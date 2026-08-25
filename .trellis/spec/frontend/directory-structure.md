# Webview Directory Structure

## Layout

```text
src/webview/
  index.tsx             # CSS imports and React root only
  App.tsx               # tabs, lists, forms, search, host snapshots
  MarkdownEditor.tsx    # constrained BlockNote integration
  vscode.ts             # acquireVsCodeApi singleton and local view state
  styles.css            # VS Code themed layout and BlockNote overrides
src/shared/             # dependency-free host/Webview contracts and search
```

## Rules

- Keep `index.tsx` as composition only.
- Add a component when it owns a distinct lifecycle or editor instance; do not create wrappers for one-line markup.
- Keep VS Code API acquisition in `vscode.ts`; `acquireVsCodeApi()` may run only once.
- Shared files cannot import React, DOM, Node, or `vscode` runtime modules.
- Keep component files PascalCase and utility modules camelCase.

## Example

`MarkdownEditor.tsx` owns BlockNote parsing, serialization, debounce, and title saving because those operations share the editor lifecycle. `App.tsx` only passes a typed save intent.
