## 阶段 1: 定位 Google 登录异常触发点
**目标**: 确认报错是否来自登录按钮逻辑、OAuth 回调，还是全局客户端脚本。
**成功标准**: 明确定位到最可疑的 `insertBefore` 调用来源，并排除 Supabase OAuth 发起代码本身。
**测试**: 检查 `app/signin/page.js`、`app/api/auth/callback/route.js`、`app/layout.js` 和全局客户端组件。
**状态**: 已完成

## 阶段 2: 修复 Clarity 脚本注入竞争条件
**目标**: 去掉容易在快速跳转时触发 DOMException 的 `insertBefore` 注入方式，改为幂等且更稳妥的脚本加载逻辑。
**成功标准**: Clarity 初始化不再依赖脆弱的参考节点，也不会重复注入脚本。
**测试**: 检查 `app/layout.js` 中脚本逻辑，确保重复执行和快速离页都不会走到非法 DOM 插入。
**状态**: 已完成

## 阶段 3: 验证登录页与全局布局
**目标**: 运行静态检查，确认登录页和根布局改动未引入新的 lint 问题。
**成功标准**: `npm run lint` 通过，计划状态与实际一致。
**测试**: 运行 `npm run lint`。
**状态**: 已完成
