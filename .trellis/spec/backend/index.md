# Extension Host Guidelines

The Trellis `backend` layer means the Node-based VS Code extension host in this project. It owns persistence, native editor integration, clipboard access, and the Webview trust boundary.

## Guidelines

| Guide                                           | Scope                                            | Status |
| ----------------------------------------------- | ------------------------------------------------ | ------ |
| [Directory Structure](./directory-structure.md) | Host, shared-contract, and test placement        | Filled |
| [Persistence](./database-guidelines.md)         | Profile-local file storage; there is no database | Filled |
| [Error Handling](./error-handling.md)           | Boundary validation and user-visible failures    | Filled |
| [Logging](./logging-guidelines.md)              | Minimal diagnostics without note content         | Filled |
| [Quality](./quality-guidelines.md)              | Host checks and review requirements              | Filled |

## Pre-Development Checklist

- Read `directory-structure.md`, `error-handling.md`, and `quality-guidelines.md` for every extension-host change.
- Also read `database-guidelines.md` when changing metadata, files, ids, or storage ordering.
- Read `logging-guidelines.md` before adding diagnostics.
- Map the full Webview message flow with `.trellis/spec/guides/cross-layer-thinking-guide.md`.
