# Implementation Plan

## Steps

1. 调整 `App.tsx`：共享 header 仅保留 Tabs，将现有 Snippet `New` 按钮移入 `.snippet-tools`，并使用 `@tabler/icons-react` 的搜索与新增图标。
2. 调整 `styles.css`：建立单一视口高度与内容区滚动链路，移除会叠加的视口最小高度；为 Snippet 工具行增加窄宽度安全布局，并删除字符图标样式。
3. 调整 `MarkdownEditor.tsx`：在现有 `onChange/getChanges()` 中识别顶层 checklist 的未完成到完成转换，使用公共 `replaceBlocks()` 将该 block 移到顶层文档末尾，再走现有 `saveSoon`。
4. 使用 BlockNote 扩展注册 IntelliJ 的上方插入快捷键，调用公共 API 插入并聚焦未勾选 checklist。
5. 增加最小可运行测试，覆盖顶层新完成项移到末尾、已在末尾不变、普通更新不动、嵌套项不动，以及快捷键处理器的插入参数和光标目标。

## Validation

- `npx prettier --write` 仅格式化本次变更文件。
- `npx eslint` 仅检查本次变更的 TypeScript/TSX 文件。
- `npm run typecheck`
- `npm test`
- `git diff --check`
- 不默认启动 Extension Development Host；没有真实运行时验证时明确报告静态验证边界。

## Risk and Rollback Points

- checklist 处理必须只匹配 `false -> true`，否则重排自身触发的变更会形成循环。
- block 重排必须保留完整 block 对象和 id，避免文本、children 或选择状态意外丢失。
- 滚动容器只能有一个高度所有者；保留并叠加旧的 `calc(100dvh - header)` 会重新引入多余滚动条。
- Snippet 新增按钮只移动 DOM 位置，事件处理和表单初始值保持不变。
