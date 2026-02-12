# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains the Next.js App Router pages, route handlers under `app/api/`, layouts, and route-level assets (icons, images).
- `components/` holds reusable UI components (buttons, sections, modals).
- `libs/` provides service integrations and helpers (e.g., `stripe.js`, `supabase/`, `resend.js`, `seo.js`).
- `public/` stores static assets served as-is.
- Root configs include `next.config.js`, `tailwindcss`/`postcss` config, `middleware.js`, and `next-sitemap.config.js`.

## Build, Test, and Development Commands
- `npm run dev` starts local development with Next.js (Turbopack).
- `npm run build` creates the production build.
- `npm run postbuild` generates the sitemap via `next-sitemap`.
- `npm run start` runs the production server from the build output.
- `npm run lint` runs Next.js ESLint rules.

## Coding Style & Naming Conventions
- JavaScript/JSX with 2-space indentation, double quotes, and semicolons (follow existing files like `app/page.js`).
- Components are PascalCase (e.g., `ButtonSignin`, `FeaturesGrid`).
- Keep Tailwind + daisyUI utility classes in JSX; avoid inline styles unless necessary.
- Use `next lint` to enforce style; keep imports sorted logically (Next.js, libs, components).

## Testing Guidelines
- No dedicated test framework is configured in this repo.
- Use `npm run lint` for baseline checks. If adding tests, document how to run them in this file.
- Doc-only changes (`*.md` only): no need to run `npm run lint`.

### Credit Smoke Tests
本仓库没有测试框架；credits 相关的联调/回归建议使用脚本：

```bash
set -a && source .env.local && set +a
node scripts/credits-rpc-smoke.mjs
```

## Commit & Pull Request Guidelines
- Recent history uses conventional prefixes such as `feat:`, `fix:`, `style:`; some commits include emojis. Prefer `type: short summary` (lowercase, imperative).
- PRs should include a clear description, impacted areas (e.g., `app/`, `components/`), and screenshots for UI changes.
- Link relevant issues or tickets when applicable.

## Configuration & Secrets
- Service integrations (Supabase, Stripe, Resend) live under `libs/`; configure via environment variables rather than hardcoding.
- Keep `.env*` files out of version control unless explicitly intended.


# Repository Guidelines

## Product Overview (Module 1 Scope)
This repo implements Module 1: the SaaS website and dashboard for a real-email verification product. The service validates whether sending to a target address is **safe** (no observed hard/soft bounce within a window) and surfaces reply-based status signals (OOO, resigned, auto-reply). It does **not** guarantee inbox placement or absolute mailbox existence. The dashboard lets users subscribe to plans, upload lists, track verification progress, and export results; Module 2 (the background verification engine) runs separately and writes results back to the database.

## Project Structure & Module Organization
- `app/`: Next.js App Router pages, layouts, API routes (see `app/api/`).
- `components/`: reusable UI components for marketing and app screens.
- `libs/`: service wrappers (auth, database, Stripe, Resend, SEO, GPT).
- `models/`: Mongoose models and plugins.
- `public/`: static assets (images, icons, social cards).
- Root config: `next.config.js`, `middleware.js`, Tailwind/PostCSS config.

## Build, Test, and Development Commands
- `npm run dev`: start local dev server.
- `npm run build`: production build.
- `npm run start`: run production server.
- `npm run lint`: ESLint via `next lint`.
- `npm run postbuild`: generate sitemap (`next-sitemap`).

## Coding Style & Naming Conventions
- JavaScript/React with Next.js App Router; prefer functional components.
- `PascalCase` for React components, `camelCase` for helpers.
- Keep styling in `app/globals.css` and Tailwind/DaisyUI utilities; avoid inline style drift.

## Testing Guidelines
- No automated tests configured. If adding tests, use `*.test.js` and document how to run them.
- 仅更新文档（只改 `*.md`）：不要求运行 `npm run lint`。

## Commit & Pull Request Guidelines
- Use Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `style:`), optional scopes (e.g., `refactor(core): ...`).
- PRs should include summary, linked issues, and UI screenshots/clips when relevant.

## Configuration & Secrets
- Integrations live in `libs/` (MongoDB, Auth, Stripe, Resend). Document any new env vars in PRs.
- 数据库表默认开启 Row Level Security（RLS）。通过 Supabase 读写数据时必须注意权限策略：通常需要 `authenticated` 会话，并且插入/更新需要满足 `auth.uid()` 归属校验（例如 Job 记录的 `user_id` 必须与当前登录用户一致）。

# 开发指南

## 严格禁止的操作

### Git 操作限制
- **绝对禁止执行 git reset、git revert、git rebase、git restore 等回滚工作的命令**
- **只允许使用 git logs、git status、git diff 等安全操作来对比文件变化以及恢复文件内容**
- **禁止删除或修改 .git 目录**
- **任何 git 操作前必须得到用户明确许可**

### 文件系统操作限制
- **绝对禁止执行 rm -rf 命令**
- **禁止删除目录，特别是项目根目录或重要目录**
- **删除文件前必须明确告知用户并得到许可**

## 沟通语言

**重要**：请使用中文与用户进行所有沟通和交流。包括：
- 所有对话和回复
- 代码注释（除非项目规范要求英文）
- 文档说明
- 错误提示和解释
- 任务计划和总结

## 理念

### 核心信念

- **渐进式进展优于大爆炸式改动** - 小改动，保证能编译通过并测试通过
- **从现有代码中学习** - 实施前先研究和规划
- **务实优于教条** - 适应项目实际情况
- **清晰的意图优于聪明的代码** - 保持无聊和明显
- **根因优先，兜底靠后** - 未弄清楚问题的根本原因之前，不要设计和实施任何兜底方案（避免掩盖真实故障与扩大排查成本）

### 简单意味着

- 每个函数/类单一职责
- 避免过早抽象
- 不要耍小聪明 - 选择无聊的解决方案
- 如果需要解释，那就太复杂了

## 流程

### 1. 规划与分阶段

将复杂工作分解为 3-5 个阶段。记录在 `IMPLEMENTATION_PLAN.md` 中：

```markdown
## 阶段 N: [名称]
**目标**: [具体交付物]
**成功标准**: [可测试的结果]
**测试**: [具体测试用例]
**状态**: [未开始|进行中|已完成]
```
- 进展时更新状态
- 所有阶段完成后删除文件

### 2. 实施流程

1. **理解** - 研究代码库中的现有模式
2. **测试** - 先写测试（红灯）
3. **实现** - 最少代码通过测试（绿灯）
4. **重构** - 在测试通过的情况下清理代码
5. **验证** - 确保编译通过且测试运行
6. **更新 TODO** - 标记已完成的任务并总结成就
7. **提交** - 使用清晰的消息链接到计划

**关键**: 代码编译成功后，始终要：
- 更新 TODO 列表标记已完成任务
- 添加完成内容的总结
- 规划下一步（如适用）
- 永远不要让 TODO 列表过时或停滞

### 3. 遇到困难时（尝试 3 次后）

**关键**: 每个问题最多尝试 3 次，然后停止。

1. **记录失败内容**：
   - 你尝试了什么
   - 具体的错误消息
   - 你认为失败的原因

2. **研究替代方案**：
   - 找到 2-3 个类似的实现
   - 记录使用的不同方法

3. **质疑根本问题**：
   - 这是正确的抽象级别吗？
   - 可以分解成更小的问题吗？
   - 有完全更简单的方法吗？

4. **尝试不同角度**：
   - 不同的库/框架功能？
   - 不同的架构模式？
   - 删除抽象而不是增加？

## 技术标准

### 架构原则

- **组合优于继承** - 使用依赖注入
- **接口优于单例** - 实现可测试性和灵活性
- **显式优于隐式** - 清晰的数据流和依赖
- **尽可能测试驱动** - 永不禁用测试，修复它们

### 代码质量

- **每次提交必须**：
  - 成功编译
  - 通过所有现有测试
  - 为新功能包含测试
  - 遵循项目格式化/代码检查规则

- **提交前**：
  - 运行格式化器/代码检查器
  - 自我审查更改
  - 确保提交消息解释"为什么"

> 例外：如果本次改动仅涉及文档（只改 `*.md` 文件），可以不运行 `npm run lint`。

### 错误处理

- 快速失败并提供描述性消息
- 包含调试上下文
- 在适当级别处理错误
- 永远不要默默吞掉异常

### 编译错误处理

**基本原则**：永远不要删除代码来绕过编译错误。修复根本原因。

遇到编译错误时：

1. **永远不要这样做**：
   - 删除有问题的方法/代码
   - 注释掉错误行
   - 使用占位符实现（TODO，抛出 NotImplemented）
   - 修改业务逻辑以匹配错误假设

2. **始终这样做**：
   - 理解错误发生的原因
   - 研究实际的数据模型/API
   - 修复你的代码以匹配现实，而不是相反
   - 如果属性不存在，找出：
     - 正确的属性名是什么？
     - 应该向模型添加此属性吗？
     - 有替代方法吗？

3. **错误解决流程**：
   ```
   错误发生 → 理解根本原因 → 研究正确解决方案 → 修复实际问题
   ```
   而不是：
   ```
   错误发生 → 删除有问题的代码 → 编译通过 ❌
   ```

4. **常见陷阱和解决方案**：
   - **属性名称不匹配**：研究实际模型，使用正确名称
   - **缺少功能**：基于实际能力实现，而不是假设
   - **类型不兼容**：理解类型，正确转换
   - **缺少依赖**：添加所需的导入/包

5. **质量优于速度**：
   - 工作的部分实现 > 破损的完整实现
   - 正确的实现 > 快速编译
   - 理解问题 > 绕过问题

**记住**：删除错误代码是在逃避问题，而不是解决问题。每个错误都是更好理解系统的机会。

## 决策框架

当存在多个有效方法时，基于以下选择：

1. **可测试性** - 我能轻松测试这个吗？
2. **可读性** - 6 个月后有人能理解这个吗？
3. **一致性** - 这与项目模式匹配吗？
4. **简单性** - 这是最简单的可行解决方案吗？
5. **可逆性** - 以后改变有多难？

## 项目集成

### 学习代码库

- 找到 3 个类似的功能/组件
- 识别常见模式和约定
- 尽可能使用相同的库/工具
- 遵循现有的测试模式

### 工具

- 使用项目现有的构建系统
- 使用项目的测试框架
- 使用项目的格式化器/代码检查器设置
- 没有强有力的理由不要引入新工具
- **可以并且更多的使用已安装的 agents** - 充分利用各种专门的 agents 来提高效率和质量

## 质量门槛

### 完成的定义

- [ ] 测试编写并通过
- [ ] 代码遵循项目约定
- [ ] 没有代码检查器/格式化器警告
- [ ] 提交消息清晰
- [ ] 实现与计划匹配
- [ ] 没有不带问题编号的 TODO

### 测试指南

- 测试行为，而不是实现
- 尽可能每个测试一个断言
- 清晰的测试名称描述场景
- 使用现有的测试工具/帮助器
- 测试应该是确定性的

## 重要提醒

**永远不要**：
- 使用 `--no-verify` 绕过提交钩子
- 禁用测试而不是修复它们
- 提交不能编译的代码
- 做假设 - 用现有代码验证
- 删除代码只为通过编译
- 使用 TODO 或占位符绕过实现
- 修改正确的业务逻辑以匹配错误的代码

**始终**：
- 增量提交工作代码
- 随时更新计划文档
- 从现有实现中学习
- 3 次失败尝试后停止并重新评估
- 从根本原因修复编译错误
- 在修复前理解错误发生的原因
- 确保实现完整且功能正常
- 产品内的提示和文案都用英文来写
