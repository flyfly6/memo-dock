# Research: VS Code WebviewView Boundaries

- Query: What are the current supported boundaries for an Activity Bar `WebviewView`, CSP/nonce, message passing, and theme integration?
- Scope: mixed
- Date: 2026-08-24

## Findings

### Files found

- `.trellis/tasks/08-24-vscode-memo-extension/prd.md:11` — selects a custom sidebar view and later requires direct Markdown editing.
- `.trellis/tasks/08-24-vscode-memo-extension/prd.md:35` — explicitly requires `WebviewView` rather than a native tree.
- `.trellis/spec/guides/cross-layer-thinking-guide.md` — requires one typed owner for messages crossing process/UI boundaries.
- No extension source exists yet; there is no local implementation pattern to reuse.

### Minimal supported shape

1. Contribute one Activity Bar container through `contributes.viewsContainers.activitybar` and one child entry through `contributes.views[containerId]` with `"type": "webview"`.
2. Register the exact view id with `vscode.window.registerWebviewViewProvider(...)` during activation.
3. In `resolveWebviewView`, enable scripts and restrict `localResourceRoots` to the extension's built output directory, not the workspace or `globalStorageUri`.
4. Convert bundle paths with `webview.asWebviewUri(...)`; never put raw file URIs into HTML.
5. Generate a fresh cryptographic nonce for each complete HTML document. Use `default-src 'none'`, allow bundled CSS from `webview.cspSource`, and allow scripts only with `script-src 'nonce-...'`.

The first-party `webview-view-sample` demonstrates the contribution/provider pair, `asWebviewUri`, `localResourceRoots`, a full HTML document, a nonce, and `default-src 'none'`. The extension should use `crypto.randomBytes(16).toString('base64')` instead of reproducing the sample's `Math.random` helper.

### CSP boundary for the selected block editor

Script CSP can remain strict: one external browser bundle with a matching nonce and no inline handlers/scripts. BlockNote's React UI and floating controls may apply runtime style attributes, so the practical MVP CSP is:

```text
default-src 'none'; img-src ${webview.cspSource} data: https:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};
```

This keeps scripts nonce-only but deliberately permits inline styles. Do not add `unsafe-eval`. Verify BlockNote's slash menu and side-menu drag handle in the Extension Development Host before claiming the CSP is sufficient.

### Message boundary

- Webview to extension: acquire the API once with `acquireVsCodeApi()`, then use `postMessage`.
- Extension to webview: use `webview.postMessage` and treat its boolean result only as delivery/enqueue status, not an application acknowledgement.
- Both sides should share one discriminated-union message contract. The extension host must validate `unknown` messages before file operations; a webview is not a trusted persistence boundary.
- Keep data operations in the extension host. The webview sends intentions (`createMarkdown`, `saveMarkdown`, `openSnippet`, and similar) and receives serializable snapshots/results.
- Avoid `retainContextWhenHidden`; persist the selected tab/search query with `getState`/`setState`, and reconstruct the editor from stored Markdown when resolved again.

### Theme boundary

Use VS Code-provided CSS variables such as `--vscode-editor-background`, `--vscode-editor-foreground`, `--vscode-input-*`, `--vscode-button-*`, and the font variables. The webview body also receives `vscode-light`, `vscode-dark`, and `vscode-high-contrast` classes. Do not query extension-host theme state for ordinary styling.

### External references

- [VS Code Webview guide](https://code.visualstudio.com/api/extension-guides/webview) — webview isolation, messaging, resources, theme variables, and security.
- [Official Webview View sample](https://github.com/microsoft/vscode-extension-samples/tree/main/webview-view-sample) — provider registration and CSP/nonce implementation.
- [Views UX guidance](https://code.visualstudio.com/api/ux-guidelines/views) — Webview Views belong in sidebar/panel containers and should be used only where native views are insufficient.
- [BlockNote repository](https://github.com/TypeCellOS/BlockNote) — selected React block editor implementation.
- [BlockNote side menu](https://www.blocknotejs.org/docs/react/components/side-menu) — insertion and drag-handle UI.

## Related specs

- `.trellis/spec/guides/cross-layer-thinking-guide.md`
- `.trellis/spec/frontend/component-guidelines.md` (currently a placeholder; update only after implementation establishes real conventions)
- `.trellis/spec/frontend/type-safety.md` (currently a placeholder)

## Caveats / Not Found

- VS Code's sample nonce generator is illustrative, not cryptographically strong.
- Strict script CSP and strict style CSP are separate claims; BlockNote runtime UI behavior must be verified in the actual webview.
- No local webview accessibility or message-contract convention exists yet.
