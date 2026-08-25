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

## Scenario: DLP-safe extension packaging

### 1. Scope / Trigger

- Applies when changing `esbuild.mjs` or the `build`, `dev`, `package`, and `publish` npm scripts.

### 2. Signatures

- `npm run build` performs a one-shot dual-bundle build.
- `npm run dev` watches both bundles.
- `npm run package` runs VSCE prepublish validation and creates a VSIX without uploading it.

### 3. Contracts

- Outputs remain `dist/extension.js` and `dist/webview.js` from the same option objects in `esbuild.mjs`.
- Load `src/**/*.ts(x)` through Node's filesystem API: enterprise DLP may return encrypted bytes to esbuild's native service while Node receives plaintext.
- The Webview build enables the `style` export condition required by BlockNote CSS.

### 4. Validation & Error Matrix

- `Unexpected "\\u0a11"` at source byte zero -> verify the Node-backed source loader is active.
- Cannot resolve `@blocknote/react/style.css` -> verify the Webview build includes `conditions: ['style']`.
- VSCE package failure -> fail the release check; do not replace it with a real publish attempt.

### 5. Good / Base / Bad Cases

- Good: watch mode creates both bundles and remains active until interrupted.
- Base: one-shot build creates the same two bundles and exits.
- Bad: packaging includes source, workspace-agent files, `node_modules`, or sourcemaps.

### 6. Tests Required

- Run Prettier and ESLint on `esbuild.mjs`, then typecheck and Node tests.
- Start `npm run dev`, assert both bundle timestamps update, then terminate it.
- Run `npm run package` and inspect the VSIX file list.

### 7. Wrong vs Correct

```js
// Wrong: native esbuild file reads can receive DLP-encrypted bytes.
await esbuild.build(options);

// Correct: keep one build config and attach the Node-backed source loader.
await esbuild.build({ ...options, plugins: [sourceLoader] });
```
