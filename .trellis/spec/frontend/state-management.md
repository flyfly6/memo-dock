# Webview State Management

## State Categories

- **Persisted content**: metadata and body files owned by the extension host.
- **Host snapshot**: serializable `ItemSnapshot[]` mirrored in React state.
- **Local navigation**: active tab and Snippet search query, stored with `vscodeApi.setState`.
- **Ephemeral UI**: snapshot-loaded state, open Snippet form, and toast text.
- **Editor state**: owned by the active BlockNote instance and serialized back to Markdown.

## Rules

- Never treat Webview state as the content source of truth.
- Derive filtered lists with `filterItems`; do not maintain a second filtered array.
- Apply the search query only to Snippets; the singleton Markdown document always opens directly.
- Send intentions to the host and accept the next snapshot instead of mutating a second persistence model locally.
- Do not add Redux, Zustand, Context, or a server-state library for this scope.

## Example

`src/webview/App.tsx` stores `{ tab, query }` through the singleton in `vscode.ts`, while items are replaced only by a validated host snapshot and the first Markdown item mounts directly.

## Scenario: Singleton Markdown Lifecycle

### 1. Scope / Trigger

- Applies whenever the Markdown Tab, its message contract, or profile storage lifecycle changes.

### 2. Signatures

- `MemoStore.ensureMarkdown(): Promise<void>`
- `MemoStore.saveMarkdown(id: string, content: string): Promise<void>`
- `WebviewMessage`: `{ type: 'saveMarkdown'; id: string; content: string }`
- `HostMessage`: `{ type: 'snapshot'; items: ItemSnapshot[] }`

### 3. Contracts

- `ready` calls `ensureMarkdown()` before the first snapshot so a fresh profile opens directly into an editor.
- The Markdown title is internal metadata. The Webview cannot create, rename, or delete Markdown documents.
- The editor sends only id and content; the store preserves internal metadata while updating content and `updatedAt`.
- Snapshot echoes must not replace BlockNote content when the document id is unchanged.

### 4. Validation & Error Matrix

- Fresh profile -> create one UUID-backed Markdown body, then return it in the snapshot.
- Existing singleton -> do not create another body or metadata entry.
- Invalid id or oversized/non-string content -> reject in `parseWebviewMessage` before I/O.
- Missing Markdown id during save -> report `Markdown document not found.` through the normal error message path.

### 5. Good/Base/Bad Cases

- Good: first `ready` creates the note and the Markdown Tab immediately mounts BlockNote.
- Base: typing, checklist changes, slash insertion, and drag reorder share the same debounced save path.
- Bad: exposing Markdown create/delete controls, trusting a title from the Webview, or recreating editor blocks after every save snapshot.

### 6. Tests Required

- Contract tests reject the former Markdown creation message and invalid save content.
- Type-check the UI/Host/Store signatures together.
- When interactive verification is authorized, confirm first-open creation, content reload, checklist persistence, Tab switching, focus states, and light/dark themes.

### 7. Wrong vs Correct

```typescript
// Wrong: the browser controls singleton metadata.
post({ type: 'saveMarkdown', id, title, content });

// Correct: the host owns metadata; the browser sends editable content only.
post({ type: 'saveMarkdown', id, content });
```
