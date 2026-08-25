# Webview Component Guidelines

## Components

- `App` owns navigation, host snapshots, Snippet search/forms/list actions, notices, and direct mounting of the singleton Markdown editor.
- `MarkdownEditor` owns exactly one constrained BlockNote instance.
- Use the installed Mantine Core components for common controls: Tabs, Button/ActionIcon, TextInput, Autocomplete, Modal, and Notification. Do not add local button, input, select, Tab, dialog, or toast primitives.
- Keep the language field on Mantine Autocomplete rather than Select so users can enter any installed VS Code language id, not only suggested values.
- Control compact density with Mantine theme `defaultProps` set to `size: 'xs'` for components that support the size prop; keep components such as Tabs at their default size. Do not shrink global `scale`, which also makes text too small. Prefer Mantine's default component styles and limit CSS overrides to layout, necessary VS Code theme adaptation, and high-contrast support. Render only BlockNote's native `DragHandleButton` through `SideMenuController`; keep 32px `padding-inline-start` and clear the editor's other padding directions so the handle stays inside the Webview without wasting document width.
- Prefer semantic HTML (`main`, `header`, `section`, `article`, `button`, `label`) over generic clickable containers.
- Keep props typed with named interfaces when they cross a component boundary.

## BlockNote

- Build the schema from `defaultBlockSpecs`, exposing only paragraph, heading, bullet/number/check lists, quote, and code block.
- Expose only Markdown-compatible bold, italic, strike, and inline-code styles.
- Use BlockNote's default slash menu. Disable the default two-button side menu and compose its exported `SideMenu` and `DragHandleButton` through `SideMenuController`; do not implement custom drag or checklist logic.
- Persist `blocksToMarkdownLossy()` output and restore with `tryParseMarkdownToBlocks()`.

## Styling and Accessibility

- Use VS Code CSS variables and editor fonts; do not bundle external fonts.
- Every icon-only button needs an `aria-label`; every input needs a label or `aria-label`.
- Preserve visible keyboard focus and high-contrast borders.
- Avoid decorative animation and card-heavy layouts in the narrow sidebar.
- Keep the shared header limited to Tab navigation and actions for the active Tab; do not restore a second in-page product title below VS Code's view title.

## Example

`src/webview/MarkdownEditor.tsx` limits both block and style schemas before passing the editor to `BlockNoteView`.
