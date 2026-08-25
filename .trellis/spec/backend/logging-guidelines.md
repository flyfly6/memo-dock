# Extension Host Logging Guidelines

Memo Dock currently has no logging dependency and no persistent diagnostic log.

## Rules

- Prefer a concise Webview error/notice for user-action outcomes.
- Use VS Code notifications only for failures that prevent the extension from functioning outside the open view.
- Never log Markdown bodies, snippet code, clipboard contents, full storage paths, or raw untrusted messages.
- Do not add structured logging, telemetry, or an output channel without a concrete support requirement.
- If temporary development logging is necessary, remove it before completing the task.

## Example

Copy success is sent as `{ type: 'notice', message: 'Snippet copied.' }`; persistence errors are normalized by `MemoDockProvider.reportError`.
