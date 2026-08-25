# 精简 Markdown Tab 编辑页面

## Goal

将 Memo Dock 从当前基础样式升级为完整、统一且适合 VS Code 侧边栏的界面，同时把 Markdown Tab 收敛为打开即可编辑的单文档页面。

## Background

- 当前 `src/webview/App.tsx` 在 Markdown Tab 中展示标题、创建按钮、搜索框、文档列表及删除操作，选中文档后才进入编辑器。
- 当前 `src/webview/MarkdownEditor.tsx` 的编辑器顶部仍展示返回按钮、文档标题输入框和删除按钮。
- 当前 `src/webview/styles.css` 为列表页和编辑器画布设置了外边距、内边距及顶部工具栏样式。
- 产品模型调整为始终只有一份 Markdown 文档，不要求兼容或迁移历史多文档数据。
- 用户要求的不只是布局清理，还包括整体 UI 的重新设计与优化；设计应基于现有 React、原生 CSS 和 VS Code 主题变量定向升级，不重写技术栈。

## Requirements

- R1：点击或恢复到 Markdown Tab 时直接展示唯一的 BlockNote Markdown 编辑器，不再展示 Markdown 的创建、搜索、列表、重命名、删除和返回入口。
- R2：Snippet Tab 纳入整体视觉重设计，但其现有增删改查、搜索、复制和原生编辑能力保持不变。
- R3：Markdown 编辑内容继续沿用现有自动保存、Markdown 转换、主题适配、斜杠菜单和块拖拽行为。
- R4：移除整体扩展页面的外边距，并移除 Markdown 编辑页顶部标题区域，使编辑区域贴合 Webview 可用空间。
- R5：不新增依赖或抽象；复用项目已安装的 `@mantine/core` 作为通用组件库，并沿用现有编辑器和存储消息。
- R6：Markdown 文档按单例存储；首次没有文档时自动创建，内部标题不作为用户可编辑或展示的信息。
- R7：重新梳理界面的视觉层级、排版、间距、色彩表面、按钮状态、空状态和窄宽度适配，使其形成一致的产品化视觉，而非仅删除边距。
- R8：继续使用 VS Code 主题变量和现有技术栈，保留可见焦点、语义标签及键盘可操作性，不引入新的 UI 或动效依赖。
- R9：Tabs、Button、ActionIcon、TextInput、Autocomplete、Modal、Notification 等常用交互组件统一使用 Mantine，不自行实现组件行为与可访问状态。
- R10：Mantine 控件统一使用 `size="xs"`，不通过全局 `scale` 缩小字体，并尽量保留组件默认样式；Webview `body` 无默认 padding；BlockNote 左侧菜单只显示拖拽柄，编辑器仅保留必要的 `padding-inline-start`。

## Acceptance Criteria

- [ ] AC1：进入 Markdown Tab 后无需选择文档即可直接编辑 Markdown 内容。
- [ ] AC2：Markdown Tab 中不显示标题、创建按钮、搜索框、文档列表、返回按钮、标题输入框和删除按钮。
- [ ] AC3：Markdown 编辑器外层无额外页面边距，编辑区域占满侧边栏可用宽度与高度。
- [ ] AC4：Markdown 内容修改仍能自动持久化，重新打开 Webview 后内容可恢复。
- [ ] AC5：Snippet Tab 的现有功能保持不变，并与 Markdown Tab 采用统一的视觉语言、间距和交互状态。
- [ ] AC6：全新存储中无需用户操作即可获得唯一 Markdown 文档；实现中不存在历史多文档迁移或兼容分支。
- [ ] AC7：重设计后的界面在 VS Code 明暗主题下均具有清晰层级、一致间距和完整的 hover、active、focus 状态。
- [ ] AC8：侧边栏窄宽度下无横向溢出，主要操作和内容仍可辨识、可操作。
- [ ] AC9：通用交互控件均来自已安装的 Mantine Core，页面 CSS 仅承担布局、VS Code 主题映射和必要的外观覆盖。
- [ ] AC10：支持尺寸属性的 Mantine 控件统一为 `xs`，字体不受全局缩放影响，Snippet 新增按钮不再突出过大；Markdown 左侧不显示新增按钮，拖拽柄完整显示且正文占用更多宽度。

## Out of Scope

- 更换 BlockNote 或改变支持的 Markdown block 类型。
- 改变 Snippet Tab 的业务功能或存储模型。
- 新增 Markdown 导入、导出、历史版本或文件选择能力。
- 兼容、合并或迁移历史多 Markdown 文档数据。

## Key Decisions

- 重设计覆盖 Markdown 与 Snippet 两个 Tab，并采用统一的“克制的编辑工作台”视觉方向。
- Markdown 是单例文档，由扩展在首次使用时自动创建；界面不暴露文档级管理操作。
- 视觉升级继续使用现有 React、Mantine Core、BlockNote 和 VS Code 主题变量，不增加依赖。
