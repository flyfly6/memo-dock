# Initialize VS Code Memo Extension

## Goal

Initialize Memo Dock as a minimal VS Code extension for managing Markdown documents, embedded checklist todos, and reusable code snippets from a custom sidebar, then configure Trellis from the conventions established by the real implementation.

## Background

- The repository currently contains only Trellis and agent scaffolding; it has no Git metadata, package manifest, extension source, tests, or application tooling.
- VS Code supports a custom Activity Bar container and a `WebviewView`, while native code editing must open in the main editor area.
- Data must be shared across workspaces in the current VS Code Profile only.

## Requirements

### R1. Project initialization

- Initialize a Git repository on `main` without creating a commit.
- Create a TypeScript VS Code extension project using npm and esbuild.
- Contribute one Memo Dock Activity Bar container and one sidebar webview.

### R2. Sidebar experience

- Provide two tabs: Markdown and Snippet.
- Use a refined, compact interface that follows VS Code light, dark, and high-contrast theme variables.
- Provide keyword search across both tabs, matching titles and body content.

### R3. Markdown documents and todos

- Create, view, rename, edit, and delete Markdown documents directly in the sidebar.
- Use a Notion-like WYSIWYG block editor for headings, paragraphs, lists, checklists, quotes, and code blocks.
- Support Markdown shortcuts, a `/` insertion menu, and block drag-and-drop.
- Represent todos only as standard Markdown checklists (`- [ ]` and `- [x]`); clicking a rendered checkbox must persist the new state.
- Persist valid Markdown semantics; exact source whitespace and bullet characters do not need byte-for-byte preservation.

### R4. Code snippets

- Store a title, VS Code language id, and code body for each snippet.
- List, create, open, delete, and copy snippets from the sidebar.
- Open snippet code in the native VS Code editor so VS Code provides syntax highlighting, completion, editing, and normal save behavior.

### R5. Persistence and safety

- Store metadata and body files under the extension's profile-local `globalStorageUri`; do not opt data into Settings Sync.
- Keep all file operations in the extension host and validate unknown webview messages before using ids or payloads.
- Restore saved content after VS Code reloads and refresh sidebar data after native snippet saves.

### R6. Trellis configuration

- Keep `session_auto_commit` at the Trellis default; do not add a project override.
- Curate task implementation and check context from verified research and thinking guides.
- Replace placeholder backend and frontend guidelines with actual extension-host and webview conventions plus real code examples after implementation.

## Acceptance Criteria

- [ ] AC1: Memo Dock appears in the Activity Bar and opens a two-tab sidebar webview.
- [ ] AC2: Markdown documents support sidebar CRUD, WYSIWYG Markdown blocks, slash insertion, block dragging, and persistent clickable checklists.
- [ ] AC3: Snippets support sidebar management and copy, then open and save through the native VS Code editor with the selected language mode.
- [ ] AC4: Search finds Markdown documents and snippets by title or body.
- [ ] AC5: Data is shared across workspaces in one Profile and survives reloads without Settings Sync.
- [ ] AC6: Webview resources use a nonce-based CSP, messages are validated, and storage paths are id-based rather than user-controlled.
- [ ] AC7: Targeted formatting, ESLint, TypeScript checking, and tests pass without build, development-server, or LSP verification.
- [ ] AC8: Trellis configuration and both spec layers describe the implemented project with real file references and examples.

## Out of Scope

- Database-style tables, properties, relations, and views.
- Real-time or asynchronous collaboration.
- Cross-machine synchronization, conflict resolution, and migration between VS Code Profiles.
- Tags, pinning, document-level manual ordering, import, and export.
