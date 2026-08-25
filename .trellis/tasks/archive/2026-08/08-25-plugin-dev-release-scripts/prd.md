# Add plugin development and release scripts

## Goal

为 Memo Dock VS Code 扩展补齐本地持续构建、VSIX 打包和发布入口，并验证产物满足发布前检查，减少手工命令和误发布风险。

## Confirmed Facts

- 当前 `build` 通过 `node esbuild.mjs` 一次性生成 `dist/extension.js` 与 `dist/webview.js`。
- VS Code 的 F5 调试配置通过 `npm: build` 预构建后启动 Extension Development Host。
- 当前没有持续监听构建脚本，也没有安装或配置 `@vscode/vsce`。
- `vscode:prepublish` 已复用 `npm run build`。
- `package.json` 当前包含 `"private": true`，发布者为 `flyfly6`，版本为 `0.0.1`。
- 项目采用 MIT License，版权人为 `flyfly6`。
- VSCE 没有无上传副作用的 `publish --dry-run`；`vsce package` 会执行 prepublish 和发布包校验，可作为安全的发布前检查，但不能验证 Marketplace 凭据与真实上传。

## Requirements

- 增加 npm 开发脚本，以监听模式持续重建扩展宿主与 Webview 两个 bundle。
- 复用现有 `esbuild.mjs` 配置，不引入第二套构建配置。
- 增加基于官方 `@vscode/vsce` 的 VSIX 打包脚本。
- 增加明确的发布命令入口；发布前继续复用现有 `vscode:prepublish` 构建。
- 验证开发监听能够启动并完成初始构建，且进程可正常终止。
- 验证 VSIX 能生成，并检查包内文件符合 `.vscodeignore` 约束。
- 本次发布验证仅执行本地发布前检查，不连接 Marketplace 或上传扩展。
- 根目录提供标准 MIT `LICENSE`，且 `package.json` 声明 `"license": "MIT"`。

## Acceptance Criteria

- [x] `npm run dev` 启动持续构建，两个 bundle 均完成初始构建。
- [x] 修改构建配置的方式保持单一，`build` 与 `dev` 共享相同 entry、target、external 等选项。
- [x] `npm run package` 成功生成当前版本的 `.vsix` 文件。
- [x] VSIX 包含运行所需的 `dist/**`、`media/**`、`package.json` 和 README，不包含源码、测试、Trellis/Codex 配置或 `node_modules`。
- [x] 发布脚本使用官方 VSCE，且不会在普通打包验证中触发真实发布。
- [x] 变更文件通过 Prettier、针对性 ESLint、类型检查和现有测试。
- [x] VSIX 包含 MIT `LICENSE`，打包过程不再报告许可证缺失警告。

## Out of Scope

- 自动升级扩展版本。
- 配置 CI/CD 或 OIDC trusted publishing。
- 新增 Marketplace 图文、CHANGELOG 或发布流水线。
- 在代码库中保存 Marketplace token。
- 真实发布扩展或验证 Marketplace 身份凭据。

## Key Decision

- 将 `vsce package` 的完整构建、清单和包内容校验作为本次发布前验证；不执行 `vsce publish`，因为 VSCE 没有无上传副作用的 publish dry-run。
