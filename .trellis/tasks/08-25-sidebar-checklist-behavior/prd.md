# 修复侧栏布局并排序已完成清单

## Goal

修复 Memo Dock 在 VS Code 窄侧栏中的多余滚动条和 Snippets 顶栏换行，并让用户勾选 Markdown checklist 后自动把已完成项移到文档末尾。

## Background

- 当前 Webview 根布局、编辑器视图和画布分别使用视口最小高度，初始内容很少时仍可能产生轻微纵向溢出。
- `src/webview/App.tsx` 将 Snippets 的新增按钮与 Tabs 放在同一个横向 `app-header` 中，侧栏变窄时会挤压 Tabs 并造成换行。
- `src/webview/MarkdownEditor.tsx` 已通过 BlockNote `onChange` 自动保存 Markdown，但尚未处理 checklist 完成后的排序。
- BlockNote 0.54.0 的变更回调可通过 `getChanges()` 取得更新前后的 block，checklist 使用 `props.checked` 表示完成状态。

## Requirements

- R1：Markdown 初始内容未超出可视区时不显示纵向滚动条；内容实际超出后仍可正常纵向滚动。
- R2：Snippets 的新增按钮移入 Snippets 内容区，不再占用 Tabs 所在顶栏；侧栏较窄时 Tabs 不因新增按钮而换行。
- R3：Snippets 的新增按钮继续打开现有创建表单，不改变创建、搜索、编辑、复制和删除行为。
- R4：Markdown checklist 从未勾选变为已勾选时，将该项移动到文档末尾，并沿用现有自动保存路径持久化新顺序。
- R5：仅由勾选动作触发自动移动；加载已有已勾选项、编辑普通内容或取消勾选时不再次自动排序。
- R6：仅自动移动顶层 checklist；嵌套 checklist 保留在原父项下，不因勾选改变层级。
- R7：继续使用现有 React、Mantine、BlockNote 和 CSS；图标统一使用 `@tabler/icons-react`，不新增消息类型或存储格式。
- R8：保持 VS Code 明暗主题、高对比度、键盘操作和已有窄侧栏适配。
- R9：Snippet 搜索框和新增按钮使用图标库中的矢量图标，搜索图标在输入框内保持视觉垂直居中。
- R10：Markdown 编辑器使用 IntelliJ 的“在当前行上方开始新行”快捷键：Windows/Linux 为 `Ctrl+Alt+Enter`，macOS 为 `Cmd+Option+Enter`；触发后在当前 block 上方插入并聚焦一个未勾选 checklist，不改变当前 block 的内容与勾选状态。

## Acceptance Criteria

- [ ] AC1：Markdown 只有截图所示少量内容时，侧栏不出现纵向滚动条。
- [ ] AC2：Markdown 内容超过侧栏高度后出现纵向滚动能力，末尾内容可访问。
- [ ] AC3：Snippets Tab 的新增按钮位于 Snippets 内容区；在截图所示窄宽度下，Markdown 与 Snippets 两个 Tab 保持同一行。
- [ ] AC4：点击移动后的新增按钮仍打开原有 Snippet 创建表单，并可完成创建。
- [ ] AC5：勾选一个未完成的 checklist 项后，该项立即位于文档末尾，文本、行内样式和子内容不丢失。
- [ ] AC6：重新打开 Webview 后，已移动 checklist 项仍位于保存后的末尾位置。
- [ ] AC7：加载已有已完成项、修改普通块或取消勾选不会触发额外重排。
- [ ] AC8：勾选嵌套 checklist 时，该项仍留在原父项下。
- [ ] AC9：格式化、变更文件 ESLint、TypeScript 类型检查、相关测试和 `git diff --check` 均通过。
- [ ] AC10：Snippet 搜索与新增按钮不再使用字符图标；搜索图标在截图所示尺寸下不再相对输入框中心下沉。
- [ ] AC11：在 Markdown 任意可编辑文本 block 中按 IntelliJ 快捷键后，其同级上方出现一个空的未勾选 checklist，光标位于新项中，原 block 保持不变。

## Out of Scope

- 改变 Snippet 的存储、消息协议或业务能力。
- 更换编辑器、增加新的 Markdown block 类型或改变 Markdown 存储格式。
- 为完成项增加分组标题、动画、撤销提示或独立归档区。
- 重新设计整个侧栏视觉系统。

## Key Decisions

- 只有顶层 checklist 在未完成变为完成时自动移到文档末尾；嵌套项保持原层级。
- 取消勾选不尝试恢复原位置，避免维护额外历史状态。
