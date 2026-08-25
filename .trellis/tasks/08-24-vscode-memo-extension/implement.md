# Implementation Plan

## 1. Initialize the repository and toolchain

- Initialize Git on `main` without staging or committing.
- Add npm metadata, lockfile, TypeScript, React, esbuild, ESLint flat config, Prettier, `.gitignore`, and VS Code launch/task configuration needed for F5 development.
- Add the Memo Dock extension manifest, Activity Bar/view contributions, commands, and a simple code-native SVG icon.
- Leave `.trellis/config.yaml` `session_auto_commit` unset so the Trellis default remains active.

## 2. Define shared contracts and persistence

- Add shared item metadata and discriminated message unions.
- Implement runtime validation for messages entering the extension host.
- Implement `globalStorageUri` index/body CRUD, id-based paths, missing-file tolerance, and case-insensitive title/body search.
- Add focused pure-logic tests for validation, search, and metadata/storage edge cases.

## 3. Implement the extension-host boundary

- Register the `WebviewViewProvider` and generate nonce-based CSP HTML with restricted local resources.
- Dispatch validated Markdown and Snippet operations and publish fresh snapshots/errors.
- Open snippet files in the native editor, apply validated language ids with plaintext fallback, refresh on save, and copy through `env.clipboard`.

## 4. Implement the sidebar webview

- Build the accessible two-tab shell, search, document/snippet lists, empty states, and CRUD controls with VS Code theme variables.
- Integrate BlockNote 0.54.0 for Markdown documents, restrict it to the accepted Markdown-compatible block set, and connect checklist, slash menu, block handle, drag reorder, and debounced Markdown export to persistence.
- Keep selected tab, active item, and search query in webview local state; reconstruct content from extension snapshots.

## 5. Configure Trellis from real code

- Populate backend specs with extension-host directory, persistence, validation, error/logging, and quality patterns.
- Populate frontend specs with webview structure, component/editor, state, type-safety, accessibility, and quality patterns.
- Include real file references and examples, then complete the bootstrap guideline checklist only where evidence exists.

## 6. Targeted verification

- Run Prettier on changed supported files.
- Run ESLint against the changed TypeScript/config scope.
- Run `tsc --noEmit` and focused unit tests.
- Run the smallest configured VS Code host smoke test only if it does not require treating a build or development server as verification; otherwise report browser/Extension Development Host interaction checks as unverified.
- Do not run build commands, development servers, watch mode, or LSP tools.
- Review the complete diff and confirm no files are staged or committed.

## Risk and Rollback Points

- Verify BlockNote slash-menu and block-handle behavior plus Markdown round trips under the chosen Webview CSP before expanding UI work.
- Keep extension-host and browser bundles isolated; shared modules must not import `vscode` or DOM globals.
- If native language assignment rejects an id, retain the snippet and open it as plaintext.
- If a persisted index references a missing body, skip it without deleting other data.
