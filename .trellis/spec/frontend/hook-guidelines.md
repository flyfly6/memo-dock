# React Hook Guidelines

## Rules

- Use hooks only for real lifecycle/state ownership; do not wrap ordinary functions in custom hooks.
- Create the BlockNote editor with `useCreateBlockNote` once per active document component.
- Store mutable debounce callbacks and latest title/save handlers in refs to avoid recreating the editor.
- Every timer, observer, and window listener must be cleaned up.
- Keep effect dependencies tied to lifecycle identity. Reload editor content when the document id changes, not after every save snapshot.

## Theme Pattern

`useVsCodeTheme` in `src/webview/App.tsx` observes the body class because VS Code changes `vscode-light`, `vscode-dark`, and high-contrast classes at runtime. Ordinary colors still come from CSS variables.

## Data Loading

There is no React Query, fetch hook, or server cache. `App` registers one `message` listener and posts one `ready` intent; the extension host sends authoritative snapshots.

## Common Mistakes

- Recreating BlockNote for every keystroke.
- Replacing editor blocks after the host echoes the same document save, which moves the cursor.
- Forgetting to clear a pending save timer when the document component unmounts.
