# Webview Quality Guidelines

## Required Patterns

- React strict TypeScript, semantic controls, keyboard focus, and high-contrast support.
- A nonce-only script CSP with resources restricted to `dist/`.
- VS Code theme variables instead of fixed application colors.
- A BlockNote schema restricted to Markdown-compatible blocks and styles.
- One debounced editor-to-Markdown save path for typing, checklist changes, slash insertion, and drag reorder.

## Dependency Rules

- Keep BlockNote packages on the compatible `0.54.0` line.
- Keep the Tiptap packages used by BlockNote overridden to `3.30.2` until the incomplete 3.30.3 release is no longer selected.
- Do not add `@blocknote/xl-*`; those packages use a different license and are outside scope.
- Reuse React and BlockNote capabilities before adding UI/state dependencies.

## Checks

- Run Prettier, ESLint, `tsc --noEmit`, and Node tests.
- Verify message changes across both bundles.
- Verify BlockNote checklist, slash menu, drag handle, Markdown round trip, focus, and theme behavior in an Extension Development Host when the user explicitly permits the required build/runtime workflow.
- Do not claim interactive proof from static checks.

## Example

`src/webview/styles.css` uses `--vscode-*` variables and explicit `:focus-visible`/high-contrast rules while adapting BlockNote without importing its optional font.
