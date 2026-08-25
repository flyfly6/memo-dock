# Implementation Plan

## Steps

1. 收窄共享消息和 Store/Provider 路径：首次 ready 时幂等创建唯一 Markdown 文档，移除 Webview 可触发的 Markdown 创建、删除和改名入口。
2. 精简 `MarkdownEditor`：删除标题状态、返回/删除工具栏及相关待保存分支，只保留内容加载、debounce 自动保存和 BlockNote 能力。
3. 重组 `App`：共享顶部只保留 Tab；Markdown 直接渲染唯一编辑器；Snippet 保留并重新排列搜索、新增、表单、列表和通知。
4. 在 Webview 根节点接入 MantineProvider，并用 Mantine Tabs、Button、ActionIcon、TextInput、Autocomplete、Modal、Notification 替换手写或浏览器原生通用控件。
5. 收敛 `styles.css` 为页面层级和必要的 VS Code 主题适配，Mantine 控件统一使用主题级 `size="xs"` 并保留默认样式，完成明暗主题、高对比度及窄宽度适配。
6. 更新现有契约测试，并增加覆盖单例消息边界的最小检查。

## Validation

- `npx prettier --write` 仅格式化本次变更文件。
- `npx eslint` 仅检查本次变更的 TypeScript/TSX 文件。
- `npm run typecheck`
- `npm test`
- `git diff --check`
- 不启动 Extension Development Host；未获用户明确授权时仅报告静态验证，不能声称完成真实交互验证。

## Risk and Rollback Points

- `src/shared/contracts.ts` 与 `src/host/provider.ts` 必须同步修改，避免 Webview/Host 消息分歧。
- `MarkdownEditor` 卸载时仍必须冲刷待保存内容，不能因删除标题/删除逻辑破坏 debounce 清理。
- Snippet 行为是回归边界；重设计仅改变结构与 CSS，不改变其消息参数和宿主打开逻辑。
