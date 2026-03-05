## 阶段 1: 基线审计
**目标**: 对照 Google favicon 与 site name 文档，确认当前实现缺口。
**成功标准**: 明确列出需要改动的文件与字段。
**测试**: 检查 `app/layout.js`、`libs/seo.js`、`app/page.js` 与图标文件尺寸。
**状态**: 已完成

## 阶段 2: SEO 元数据与结构化数据改造
**目标**: 补齐 favicon 声明与首页 `WebSite` 结构化数据，并修正站点名字段逻辑。
**成功标准**: 首页输出可被 Google 使用的 `WebSite` JSON-LD，metadata 中有明确 favicon 链接与稳定站点名。
**测试**: 本地代码检查脚本输出，确认 JSON-LD 字段与 metadata 字段存在且值正确。
**状态**: 已完成

## 阶段 3: 验证与收尾
**目标**: 运行 lint 验证改动并总结结果。
**成功标准**: `npm run lint` 通过；计划文档完成后删除。
**测试**: `npm run lint`
**状态**: 已完成
