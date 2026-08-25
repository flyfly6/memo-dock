# Memo Dock

Memo Dock keeps one profile-wide Markdown note, checklist todos, and code snippets in the VS Code sidebar.

## Development

- Press `F5` to build and open an Extension Development Host.
- Run `npm run typecheck`, `npm run lint`, and `npm test` for targeted checks.

Snippet code opens in the native VS Code editor. The Markdown tab uses a constrained BlockNote editor and persists the note as Markdown under the current profile's extension storage.

In the Markdown editor, press `Ctrl+Alt+Enter` (`Cmd+Option+Enter` on macOS) to insert an unchecked checklist item above the current block.
