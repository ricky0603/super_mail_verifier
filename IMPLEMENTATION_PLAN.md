## 阶段 1: 需求对齐与数据口径
**目标**: 把 Dashboard 统计切换为业务指标（已验证/有效/无效），并用每日 usage chart 替换 Recent lists。
**成功标准**: 明确“已验证=SAFE+BOUNCE”，“有效=SAFE”，“无效=BOUNCE”；usage chart 按天聚合提交验证的邮箱数。
**测试**: N/A
**状态**: 已完成

## 阶段 2: Dashboard UI 与查询实现
**目标**: 更新 `/dashboard`：业务统计卡片 + Usage 柱状图，保留 Quick actions / Job status。
**成功标准**: 页面在有/无数据时都能正常展示，且不会出现明显的性能陷阱（只拉必要字段）。
**测试**: 手动打开 `/dashboard`，验证统计/图表显示。
**状态**: 已完成

## 阶段 3: 验证与收尾
**目标**: 运行 `npm run lint`，确保无新增 warning。
**成功标准**: lint 不新增问题。
**测试**: `npm run lint`
**状态**: 已完成

## 阶段 4: 对齐与补充信息
**目标**: 调整 Usage 卡片高度与右侧模块对齐；新增最近 3 个 job 状态区域。
**成功标准**: Usage 卡片与右侧列同高；Recent jobs 显示 3 条且可跳转详情。
**测试**: 手动打开 `/dashboard`，检查对齐与跳转。
**状态**: 已完成
