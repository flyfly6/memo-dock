# Extension Host Directory Structure

## Layout

```text
src/
  extension.ts          # activation and disposable registration only
  host/
    provider.ts         # WebviewView, message dispatch, native VS Code APIs
    store.ts            # profile-local metadata and body files
  shared/
    contracts.ts        # types and unknown-message decoder
    filter.ts           # dependency-free search projection
test/                   # Node tests for shared pure logic
```

## Rules

- Keep activation composition in `src/extension.ts`; feature behavior belongs in `src/host/`.
- Keep `vscode`, Node, and filesystem imports out of `src/shared/` so both runtime bundles can import it.
- Put all Webview request dispatch in `MemoDockProvider`; do not register parallel command paths for the same operation.
- Put all profile data paths and index ordering in `MemoStore`.
- Use PascalCase for classes/components and camelCase for functions and modules.

## Example

`src/extension.ts` constructs one `MemoStore`, injects it into `MemoDockProvider`, and registers one save listener. New host behavior should extend those owners instead of creating another store or provider.
