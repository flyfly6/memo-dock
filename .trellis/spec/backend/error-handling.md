# Extension Host Error Handling

## Boundary Rules

- Treat Webview messages as `unknown` and decode them once with `parseWebviewMessage` from `src/shared/contracts.ts`.
- Validate UUIDs, title/language lengths, kinds, and Markdown size before any file operation.
- Exhaustively dispatch the decoded union; never cast individual fields in handlers.
- Return serializable `{ type: 'error', message }` messages to the Webview. Do not expose filesystem paths or stored content.

## Expected Failures

- A missing index means an empty store.
- A missing indexed body is skipped during listing.
- Deleting an already-missing Snippet body still removes its metadata; Markdown has no Webview delete operation.
- An unavailable snippet language falls back to plaintext while keeping the file editable.
- Invalid/corrupt `index.json` is a visible error, not silently replaced.

## Example

`src/host/provider.ts` chains each operation and funnels rejections through `reportError`. `src/host/store.ts` catches only `FileSystemError` with `code === 'FileNotFound'` in absence-tolerant paths.
