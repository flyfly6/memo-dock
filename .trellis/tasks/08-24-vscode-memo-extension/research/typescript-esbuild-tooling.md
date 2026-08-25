# Research: TypeScript and esbuild Tooling

- Query: What is the minimum TypeScript/esbuild setup for separate VS Code extension-host and Webview entries, plus tests, lint, and type checking under the project's verification restrictions?
- Scope: mixed
- Date: 2026-08-24

## Findings

### Files found

- `.trellis/tasks/08-24-vscode-memo-extension/prd.md:57` — requires targeted formatting, lint, type checking, and tests without build/dev-server verification.
- `.trellis/spec/frontend/quality-guidelines.md` — currently an unfilled template, so no project-specific tooling convention exists yet.
- No `package.json`, TypeScript config, build script, test config, or source entry exists.

### Minimal two-platform build

Use one small `esbuild.mjs` that makes two independent `esbuild.build` calls (or contexts only for an explicitly requested watch mode):

| Entry                  | Platform/format    | Output              | Key options                                                             |
| ---------------------- | ------------------ | ------------------- | ----------------------------------------------------------------------- |
| `src/extension.ts`     | `node` / `cjs`     | `dist/extension.js` | `bundle: true`, `external: ['vscode']`, sourcemap outside production    |
| `src/webview/index.ts` | `browser` / `iife` | `dist/webview.js`   | `bundle: true`; CSS imported from this entry emits a sibling CSS bundle |

The different platform settings are mandatory: the extension host can import `vscode` and Node APIs; the webview cannot. Do not share a runtime module that imports `vscode` with the browser entry. Share only dependency-free TypeScript types/constants.

Point `package.json.main` to `./dist/extension.js`. The webview provider creates `asWebviewUri` links for `dist/webview.js` and emitted CSS. Keep `vscode` external because the runtime provides it.

As of the research date, npm reports esbuild `0.28.2`. The official VS Code bundling guide confirms that esbuild strips TypeScript types but does not type-check, so `tsc --noEmit` is a separate required command.

### Minimal checks and scripts

Use existing standard tools only:

- Formatting: Prettier on changed source/config files.
- Type checking: `tsc --noEmit -p tsconfig.json`.
- Lint: ESLint flat config with `@eslint/js` and `typescript-eslint`; run against changed `.ts` files or the small `src` tree.
- Pure logic tests: Node's built-in `node:test` and `assert`, compiled to a temporary/test output by `tsc`; avoid adding a second unit-test framework.
- One VS Code integration smoke test only where host APIs must be proven, using `@vscode/test-cli` plus `@vscode/test-electron` and a `.vscode-test.mjs` configuration.

Suggested separation:

```text
npm run format
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
```

Do not use `npm run build`, the esbuild script, watch mode, or a development server as verification. Building remains a packaging/runtime prerequisite and can be invoked by the user for F5/package workflows, but the task quality gate must report only targeted format/lint/typecheck/tests. Integration tests may compile test TypeScript with `tsc`; they need a produced extension bundle to launch, so run them only in an explicitly prepared runtime workflow, not as a substitute for the forbidden build verification.

### Version policy

- Pin BlockNote runtime packages to the same compatible `0.54.0` line and commit the lockfile.
- Dev tooling may use compatible ranges and a committed lockfile.
- Keep `@types/vscode` at the nearest published declaration set that does not exceed `engines.vscode`; npm skips some VS Code release numbers.
- Keep only `@vscode/test-cli` and `@vscode/test-electron` for integration testing; do not add Mocha directly because the test CLI already uses it.

### External references

- [VS Code bundling extensions guide](https://code.visualstudio.com/api/working-with-extensions/bundling-extension) — official esbuild configuration, `vscode` externalization, and separate `tsc --noEmit` requirement.
- [VS Code testing extensions guide](https://code.visualstudio.com/api/working-with-extensions/testing-extension) — current `@vscode/test-cli` and `@vscode/test-electron` setup.
- [esbuild build API](https://esbuild.github.io/api/#build-api) — platform, format, external, entry point, output, and source-map options.
- [Official Webview View sample](https://github.com/microsoft/vscode-extension-samples/tree/main/webview-view-sample) — current TypeScript/ESLint baseline.
- [npm: esbuild](https://www.npmjs.com/package/esbuild) — version snapshot (`0.28.2` on 2026-08-24).

## Related specs

- `.trellis/spec/frontend/index.md`
- `.trellis/spec/frontend/directory-structure.md` (currently a placeholder)
- `.trellis/spec/frontend/quality-guidelines.md` (currently a placeholder)
- `.trellis/spec/frontend/type-safety.md` (currently a placeholder)

## Caveats / Not Found

- There is no current project package manager choice; npm is the minimum default because the repository has no workspace tooling to reuse.
- A Webview browser bundle is still required to run the extension even though build output cannot be used as the verification result.
- Browser-level interaction proof for BlockNote drag/checklist behavior requires an Extension Development Host and cannot be replaced by static type checks.
