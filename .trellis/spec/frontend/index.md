# Webview Frontend Guidelines

The frontend is a React Webview bundled separately from the VS Code extension host. BlockNote is the only rich-text editor and is restricted to Markdown-compatible blocks.

## Guidelines

| Guide                                           | Scope                                    | Status |
| ----------------------------------------------- | ---------------------------------------- | ------ |
| [Directory Structure](./directory-structure.md) | React/Webview file placement             | Filled |
| [Components](./component-guidelines.md)         | Component and BlockNote patterns         | Filled |
| [Hooks](./hook-guidelines.md)                   | React effects and VS Code theme state    | Filled |
| [State Management](./state-management.md)       | Host snapshots vs local navigation state | Filled |
| [Type Safety](./type-safety.md)                 | Shared messages and runtime checks       | Filled |
| [Quality](./quality-guidelines.md)              | Accessibility, CSP, and checks           | Filled |

## Pre-Development Checklist

- Read all six guides for Webview changes; this frontend is small and the contracts are coupled.
- Read `.trellis/spec/guides/cross-layer-thinking-guide.md` when adding or changing a message.
- Search BlockNote's installed API before writing custom editor behavior.
- Keep the browser entry free of `vscode` and Node imports.
