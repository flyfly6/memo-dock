# Webview Component Guidelines

## Components

- `App` owns navigation, host snapshots, search, lightweight forms, notices, and list actions.
- `MarkdownEditor` owns exactly one constrained BlockNote instance.
- Prefer semantic HTML (`main`, `header`, `section`, `article`, `button`, `label`) over generic clickable containers.
- Keep props typed with named interfaces when they cross a component boundary.

## BlockNote

- Build the schema from `defaultBlockSpecs`, exposing only paragraph, heading, bullet/number/check lists, quote, and code block.
- Expose only Markdown-compatible bold, italic, strike, and inline-code styles.
- Use BlockNote's default slash and side menus; do not implement custom drag or checklist logic.
- Persist `blocksToMarkdownLossy()` output and restore with `tryParseMarkdownToBlocks()`.

## Styling and Accessibility

- Use VS Code CSS variables and editor fonts; do not bundle external fonts.
- Every icon-only button needs an `aria-label`; every input needs a label or `aria-label`.
- Preserve visible keyboard focus and high-contrast borders.
- Avoid decorative animation and card-heavy layouts in the narrow sidebar.

## Example

`src/webview/MarkdownEditor.tsx` limits both block and style schemas before passing the editor to `BlockNoteView`.
