# Memo Dock 整体 UI 重设计

## Architecture and Boundaries

- `MemoStore` 继续拥有持久化。新增一个幂等的单例 Markdown 获取/创建入口；首次没有 Markdown 时创建固定内部标题的空文档。
- `MemoDockProvider` 在处理 Webview `ready` 前确保单例 Markdown 已存在，再发送现有 snapshot，不引入新的加载协议。
- Webview 保留 `App` 与 `MarkdownEditor` 两个业务组件：`App` 负责 Tab、Snippet 管理和 snapshot；`MarkdownEditor` 只负责唯一 BlockNote 实例及内容自动保存。通用控件直接使用已安装的 Mantine Core，不创建本地基础组件。
- 共享消息收窄 Markdown 的外部 CRUD 能力：Webview 不再发送 Markdown 创建、删除或改名意图，Snippet 消息保持现有语义。

## Data Flow

1. Webview 发送 `ready`。
2. Host 确保唯一 Markdown 文档存在，并返回包含 Markdown 与 Snippet 的 snapshot。
3. Markdown Tab 从 snapshot 读取唯一 Markdown 项并直接挂载 `MarkdownEditor`。
4. 编辑器变更继续通过现有 400ms debounce 发送 `saveMarkdown`，内部标题保持不变。
5. Snippet Tab 继续从 snapshot 派生搜索结果并发送创建、编辑、复制、删除和打开意图。

## UI Direction

- 采用克制的编辑工作台：内容优先、紧凑但不拥挤、弱化容器感，以 VS Code 主题表面和一条主强调色建立层级。
- 顶部只保留紧凑 Tab 导航；Memo Dock 品牌标题从页面内移除。
- Markdown Tab 为无外层边距的全宽编辑区，不显示返回、标题、删除工具栏。
- Snippet Tab 重新组织为紧凑工具区与清晰列表：搜索和新增操作保留，表单、空状态、列表行及反馈状态采用统一节奏。
- 根节点引入 Mantine Core 样式并由 `MantineProvider` 跟随 VS Code 明暗主题；Tabs、Button、ActionIcon、TextInput、Autocomplete、Modal 和 Notification 使用 Mantine 组件及 Styles API 映射 VS Code CSS 变量。语言控件使用 Autocomplete 而非封闭 Select，以保留任意 VS Code language id 输入；删除确认使用 Modal 统一焦点与取消行为。
- 只使用项目已有字体和 VS Code CSS 变量；保留 focus-visible、高对比度和窄侧边栏适配；动效仅用于 hover/pressed 的短过渡。
- MantineProvider 对支持 `size` 的控件通过主题级 `defaultProps.size = "xs"` 控制紧凑密度，不修改全局 `scale`；Tabs 等不支持 `size` 的组件保留默认尺寸和样式。CSS 只保留页面布局、必要的 VS Code 主题适配和高对比度处理。显式清零 `body` padding；BlockNote 使用原生 `SideMenuController` 只渲染拖拽柄，编辑器清除其他方向 padding，仅保留 32px `padding-inline-start`。

## Compatibility and Trade-offs

- 不处理历史多 Markdown 文档；该产品模型直接以单例为前提。
- 复用 BlockNote 已带入的 `@mantine/core`，不新增第二套主题、图标或动画依赖，避免额外 Webview 体积和 CSP 变化。
- 不重写 BlockNote 样式体系，只调整其外层画布及必要的编辑器覆盖，降低编辑行为回归风险。

## Rollback

- UI 与数据模型改动保持在现有 Webview、共享协议、Provider 和 Store 文件中，可按文件恢复。
- 单例首次创建仍使用现有 index/body 格式，因此回滚不会产生新格式数据。
