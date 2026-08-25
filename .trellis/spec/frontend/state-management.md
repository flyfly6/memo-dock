# Webview State Management

## State Categories

- **Persisted content**: metadata and body files owned by the extension host.
- **Host snapshot**: serializable `ItemSnapshot[]` mirrored in React state.
- **Local navigation**: active tab and search query, stored with `vscodeApi.setState`.
- **Ephemeral UI**: selected item, open form, and toast text.
- **Editor state**: owned by the active BlockNote instance and serialized back to Markdown.

## Rules

- Never treat Webview state as the content source of truth.
- Derive filtered lists with `filterItems`; do not maintain a second filtered array.
- Apply one search query to both tabs, then filter by the active kind.
- Send intentions to the host and accept the next snapshot instead of mutating a second persistence model locally.
- Do not add Redux, Zustand, Context, or a server-state library for this scope.

## Example

`src/webview/App.tsx` stores `{ tab, query }` through the singleton in `vscode.ts`, while items are replaced only by a validated host snapshot.

## Scenario: Save Responses and Destructive Navigation

### 1. Scope / Trigger

- Applies when a Webview action both changes persisted content and can change the active editor.

### 2. Signatures

- `MemoDockProvider.refresh(focusId?: string): Promise<void>`
- `MarkdownEditorProps.onDelete(id: string): boolean`

### 3. Contracts

- `focusId` is only for explicit navigation, such as focusing a newly created Markdown document.
- Ordinary save snapshots omit `focusId`; an older save response must not reopen an editor the user left.
- `onDelete` returns `false` when confirmation is cancelled and no queued save state may be discarded.

### 4. Validation & Error Matrix

- Save succeeds after Back -> refresh list, keep the list visible.
- Delete is cancelled -> retain the pending debounce and editor selection.
- Delete is confirmed -> discard the pending save, post `deleteItem`, then leave the editor.

### 5. Good/Base/Bad Cases

- Good: creation refreshes with the new id; later saves refresh without one.
- Base: a save while the editor stays open updates the host snapshot without replacing BlockNote state.
- Bad: every save echoes `focusId`, or cancellation clears the save timer before confirmation succeeds.

### 6. Tests Required

- Verify Back during a pending save remains on the list after the save snapshot arrives.
- Verify cancelling Delete preserves edits and a later Back still flushes them.
- Verify confirming Delete does not emit a trailing `saveMarkdown` for the deleted id.

### 7. Wrong vs Correct

```typescript
// Wrong: a delayed save response can force navigation.
await this.refresh(message.id);

// Correct: saves refresh data without changing selection.
await this.refresh();
```
