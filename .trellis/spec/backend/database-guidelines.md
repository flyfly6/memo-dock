# Profile Storage Guidelines

Memo Dock has no database, ORM, migration system, or workspace storage. The source of truth is plain files below `ExtensionContext.globalStorageUri`.

## Layout and Metadata

```text
globalStorageUri/
  index.json
  markdown/<uuid>.md
  snippets/<uuid>.txt
```

- `index.json` stores ids, kinds, titles, language ids, and timestamps.
- Bodies stay in Markdown or text files and are read for search.
- Generate ids with `crypto.randomUUID()`; never derive filenames from titles or Webview payloads.

## I/O Rules

- Use `vscode.workspace.fs` and `Uri.joinPath`, not Node `fs` or `uri.fsPath`, so remote extension hosts work.
- Write a body before adding/updating its metadata entry.
- Missing indexed bodies are skipped; orphan bodies are ignored. Do not add migrations until a real format change exists.
- Markdown is a singleton product concept. Call `ensureMarkdown()` before the first Webview snapshot; it creates a UUID-backed empty body only when no Markdown metadata exists.
- Do not expose Markdown create/delete/rename operations across the Webview boundary. `saveMarkdown(id, content)` preserves the internal title and only updates the body and `updatedAt`.
- Serialize writes through the provider's single operation queue. Split locks only if measured throughput requires it.
- Do not call `globalState.setKeysForSync`; data is current-profile only.

## Example

`src/host/store.ts` validates `index.json`, writes Markdown before `writeIndex`, and tolerates only `FileNotFound` where absence is expected.
