## 阶段 1: 审核现有 Sentry 接入
**目标**: 确认当前 Next.js + Sentry 的初始化链路、构建上传链路和错误边界覆盖范围。
**成功标准**: 明确识别出有效配置、风险配置和实际漏报点。
**测试**: 检查 `next.config.mjs`、`instrumentation*.js`、`sentry.*.config.js`、`app/error.js`、`app/global-error.jsx`。
**状态**: 已完成

## 阶段 2: 收敛运行时配置并补齐错误上报
**目标**: 用统一的运行时配置降低生产噪音与隐私风险，并确保根级错误边界也会上报 Sentry。
**成功标准**: 三端初始化使用一致配置，`app/error.js` 能显式调用 `Sentry.captureException`。
**测试**: 检查 `instrumentation-client.js`、`sentry.server.config.js`、`sentry.edge.config.js`、`app/error.js` 的改动。
**状态**: 已完成

## 阶段 3: 验证构建与静态检查
**目标**: 确认调整后的 Sentry 配置没有引入新的构建或 lint 问题。
**成功标准**: `npm run build` 与 `npm run lint` 通过。
**测试**: 运行 `npm run build`、`npm run lint`。
**状态**: 已完成

## 完成总结
- 已统一客户端、Node.js 与 Edge 的 Sentry 运行时配置，降低生产环境默认采样和日志噪音。
- 已补上 `app/error.js` 的显式异常上报，避免根级错误边界漏报。
- 已显式接入 `SENTRY_AUTH_TOKEN` 到构建配置，并完成 `npm run build` 与 `npm run lint` 验证。
