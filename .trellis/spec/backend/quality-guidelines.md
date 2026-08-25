# Extension Host Quality Guidelines

## Required Patterns

- TypeScript strict mode and one discriminated message contract.
- Runtime validation at the Webview entry point.
- ID-only storage paths and URI-based VS Code filesystem APIs.
- One owner for persistence and one owner for message dispatch.
- Register every VS Code disposable through `context.subscriptions`.

## Forbidden Patterns

- `any`, unchecked Webview payload casts, title-derived paths, Node `fs`, silent index resets, or duplicate save implementations.
- Treating `webview.postMessage` as an application acknowledgement.
- Running build, a development server, or LSP as the project verification result.

## Checks

- Add a Node `node:test` case for new pure validation/search/normalization branches.
- Run Prettier, ESLint, `tsc --noEmit`, and focused tests.
- Review CSP, message variants, store methods, and UI callers together when changing a cross-boundary action.

## Example

`test/contracts.test.ts` proves path-like ids and invalid payloads are rejected before they reach `MemoStore`.
