# 侧栏布局与已完成清单排序设计

## Architecture and Boundaries

- `src/webview/App.tsx` 只调整现有 Tabs 与 Snippet 工具区的结构，不改变状态、消息或 Snippet 表单逻辑。
- `src/webview/styles.css` 让 `.app-shell` 成为固定视口高度的纵向 flex 容器，Markdown 与 Snippet 内容区承担实际纵向滚动，避免多个 `min-height: 100dvh` 叠加造成初始溢出。
- `src/webview/MarkdownEditor.tsx` 在现有 BlockNote `onChange` 回调中识别 checklist 的 `false -> true` 更新并重排，继续复用同一个 debounce 保存入口。
- Host、Store 和共享消息不变；排序后的 Markdown 仍以现有字符串格式保存。

## UI Layout

1. 共享 `app-header` 只保留 Tabs。
2. Snippets 的 `New` 按钮移动到 `.snippet-tools`，与搜索框构成 `minmax(0, 1fr) auto` 工具行。
3. `.app-shell` 使用 `height: 100dvh`、`display: flex`、`flex-direction: column` 和 `overflow: hidden`。
4. `.editor-view` 与 `.snippet-view` 使用 `flex: 1`、`min-height: 0` 和 `overflow-y: auto`；编辑器画布以 `min-height: 100%` 填满剩余空间。
5. 内容未超过剩余高度时滚动条隐藏，超过后只由活动内容区滚动；窄宽度下 Tabs 不再与新增按钮争用空间。
6. 搜索与新增按钮分别使用 `@tabler/icons-react` 的 `IconSearch` 和 `IconPlus`；SVG 由 Mantine 的 section 布局居中，不保留字符字形基线补丁。

## Checklist Data Flow

1. BlockNote `onChange` 提供 `getChanges()`。
2. 仅匹配 `type === 'update'`、更新前后均为 `checkListItem`、`prevBlock.props.checked === false` 且 `block.props.checked === true` 的变更。
3. 通过 `editor.document` 中是否存在该 id 判断它是顶层 block；嵌套项不处理。
4. 若该 block 已是最后一个顶层 block，则不重排；否则只取从该 block 到文档末尾的连续顶层后缀，通过 BlockNote 公共 `replaceBlocks` API 旋转为“后续 blocks + 已完成 block”。完整 block 对象保留 id、内容、属性和 children。
5. 重排产生的第二次 `onChange` 只包含 move，不再命中 `false -> true` 条件；现有 `saveSoon` 对最终文档状态做一次 debounce 持久化。

## Checklist Insert Shortcut

1. 通过 BlockNote `createExtension` 注册 `Mod-Alt-Enter`，对应 Windows/Linux `Ctrl+Alt+Enter` 与 macOS `Cmd+Option+Enter`。
2. 处理器读取当前文本光标所在 block，使用公共 `insertBlocks` API 在同级 `before` 位置插入 `checked: false` 的 `checkListItem`。
3. 使用 `setTextCursorPosition(..., 'start')` 将光标移入新项；插入事件继续通过现有 `onChange` 自动保存。
4. 不覆盖 BlockNote 原生 `Enter`、`Shift+Enter`、`Shift-Mod-ArrowUp` 或 `Shift-Mod-ArrowDown`。

## Compatibility and Trade-offs

- 使用 BlockNote 0.54.0 公共 `getChanges()`、`editor.document` 与 `replaceBlocks()`，不依赖内部 ProseMirror/Tiptap API。
- `@tabler/icons-react` 仅按名称导入两个 SVG React 组件，由 bundler tree-shake 未使用图标。
- 快捷键沿用 IntelliJ 键位，避免发明新的组合；扩展仅调用 BlockNote 公共 API，不接触 ProseMirror 私有事务。
- 后缀旋转是 O(n)，但避免增加自定义事务逻辑；Memo Dock 单文档侧栏场景下足够，只有出现可测量的超长文档性能问题时才考虑底层单-block move。
- 取消勾选不恢复位置；恢复需要额外记录原索引并引入跨会话状态，超出需求。
- 嵌套 checklist 不移动，避免将子项提升为顶层而破坏文档结构。

## Rollback

- UI 回滚仅涉及 `App.tsx` 和 `styles.css` 的布局差异。
- checklist 回滚仅移除 `MarkdownEditor.tsx` 的变更识别与排序逻辑；持久化协议和已有 Markdown 数据无需迁移。
