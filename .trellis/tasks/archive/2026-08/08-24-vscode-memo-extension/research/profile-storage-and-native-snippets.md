# Research: Profile Storage and Native Snippet Editing

- Query: What is the minimum current API path for profile-local files under `globalStorageUri` and native snippet editing/saving?
- Scope: mixed
- Date: 2026-08-24

## Findings

### Files found

- `.trellis/tasks/08-24-vscode-memo-extension/prd.md:21` — requires snippet editing in the native editor.
- `.trellis/tasks/08-24-vscode-memo-extension/prd.md:33` — requires snippet files under profile-local `globalStorageUri`.
- `.trellis/tasks/08-24-vscode-memo-extension/prd.md:38` — keeps list/create/delete/copy in the sidebar and editing in the native editor.
- No existing persistence implementation or migration format exists.

### Storage contract

`ExtensionContext.globalStorageUri` is an extension-private directory shared across workspaces. Create it with `vscode.workspace.fs.createDirectory`, then use `Uri.joinPath` plus `workspace.fs.readFile/writeFile/delete`. Do not use Node `fs` or `uri.fsPath`; URI-based APIs also work in remote extension hosts.

For the smallest readable model, use one metadata index plus source files:

```text
globalStorageUri/
  index.json
  markdown/<id>.md
  snippets/<id>.txt
```

`index.json` owns ids, titles, type, snippet language id, and timestamps. Markdown/snippet bodies remain plain files and are the search source of truth. Generate ids with `crypto.randomUUID()`. Keep filenames id-based so titles cannot escape the storage directory.

Do not call `globalState.setKeysForSync`; file data under `globalStorageUri` is not opted into Settings Sync by that API.

### Profile-local compatibility boundary

Current VS Code source resolves an extension's path by joining the extension id to `environment.globalStorageHome`. Commit `895db1d` changed extension-host initialization from the default profile's `globalStorageHome` to the current profile's `globalStorageHome`. To guarantee the explicitly requested current-profile behavior, set `engines.vscode` to the release containing that change (current indexed source is 1.117) or verify the final minimum version before publishing. Supporting older clients while promising strict per-profile isolation is not safe without a compatibility layer.

### Native snippet open/save path

1. Ensure `snippets/<id>.txt` exists with `workspace.fs.writeFile`.
2. `const document = await vscode.workspace.openTextDocument(uri)`.
3. If metadata contains a valid VS Code language id, call `vscode.languages.setTextDocumentLanguage(document, languageId)`; catch an unknown language id and leave plaintext.
4. `await vscode.window.showTextDocument(document, { preview: false })`.
5. Subscribe once to `workspace.onDidSaveTextDocument`; when `document.uri` matches a managed snippet URI, refresh the sidebar snapshot/search index. Normal Ctrl+S writes the file directly, so no custom editor or save command is needed.

Use `.txt` plus `setTextDocumentLanguage` rather than inventing a language-to-extension map. `languages.getLanguages()` validates available ids, but VS Code does not expose an API that maps every language id to a canonical extension. Reapply the language each time the file is opened.

One-click copy should read the current file through `workspace.fs.readFile` and call `env.clipboard.writeText`; it must not depend on potentially stale webview state.

### External references

- [VS Code common capabilities: data storage](https://code.visualstudio.com/api/extension-capabilities/common-capabilities#data-storage) — storage scopes and Settings Sync opt-in.
- [VS Code API: ExtensionContext](https://code.visualstudio.com/api/references/vscode-api#ExtensionContext) — `globalStorageUri` and URI-based filesystem guidance.
- [VS Code API: workspace.openTextDocument](https://code.visualstudio.com/api/references/vscode-api#workspace.openTextDocument) — opens file-backed documents.
- [VS Code API: languages.setTextDocumentLanguage](https://code.visualstudio.com/api/references/vscode-api#languages.setTextDocumentLanguage) — applies a language id to an open document.
- [VS Code commit 895db1d](https://github.com/microsoft/vscode/commit/895db1d) — changes `globalStorageHome` from default profile to current profile.
- [Current storage-path implementation](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/api/common/extHostStoragePaths.ts#L80-L82) — extension-id subdirectory construction.

## Related specs

- `.trellis/spec/guides/cross-layer-thinking-guide.md`
- `.trellis/spec/frontend/state-management.md` (currently a placeholder)
- `.trellis/spec/frontend/type-safety.md` (currently a placeholder)

## Caveats / Not Found

- The exact stable release first containing commit `895db1d` was not documented on the API page; verify it before finalizing `engines.vscode`.
- Native editor language mode is reapplied at open time and is not metadata embedded in the `.txt` file.
- Atomic multi-file transactions are not provided. For MVP, write the body first and index second; recovery can ignore orphan files and missing indexed files.
