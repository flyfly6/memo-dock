# Webview Type Safety

## Contract Ownership

- `src/shared/contracts.ts` owns item types, Webview messages, host messages, UUID validation, and the unknown-message decoder.
- Both bundles import the same discriminated unions; components must not redeclare payload shapes.
- Use exhaustive `switch` dispatch in the extension host.

## Runtime Validation

- Validate messages entering the extension host even though they originate from the bundled Webview.
- Validate title/language lengths, UUIDs, kinds, and Markdown size before I/O.
- The Webview checks the host message discriminant before updating React state.

## Forbidden Patterns

- `any`, double casts, locally repeated `event.data as ...`, raw object spreading into file operations, or user-controlled path segments.
- Importing host-only `vscode` types as runtime values in the browser bundle.

## Example

`parseWebviewMessage` returns a typed union or `undefined`; `MemoDockProvider` never reads fields from the original unknown object.
