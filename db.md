# 数据库表结构（V1）

本文档用于记录当前版本的数据库结构（Supabase / Postgres）。后续如有新增/变更，请同步更新此文件，便于产品与后端实现对齐。

## 枚举类型

### `task_status`

用于任务（Job）的状态字段。

- 默认值：`QUEUE`（全大写）
- 典型状态：`QUEUE` / `VERIFYING` / `COMPLETE`

> 注意：Postgres enum 的值大小写敏感；SQL 里的默认值必须与枚举值完全一致。

## 表

### `verification_jobs`

一次上传/一次验证任务（Job）。V1 暂无 workspace 概念。

```sql
create table public.verification_jobs (
  id uuid primary key default gen_random_uuid(),

  user_id uuid null, -- auth.users.id（可选）

  name text not null,            -- 111.csv 或用户自定义
  source_filename text null,     -- 原始文件名（可选）
  source_storage_path text null, -- 文件存储路径（可选）

  status public.task_status not null default 'QUEUE',

  unique_emails integer not null default 0, -- 上传时去重后的唯一邮箱数量

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index verification_jobs_created_at_idx on public.verification_jobs (created_at desc);
create index verification_jobs_status_idx on public.verification_jobs (status);
```

#### 字段说明

- `unique_emails`：上传阶段去重后的数量；入库后的邮箱 task 也应保证唯一（通过 `email_tasks` 表的唯一键实现，后续补充）。
- `updated_at`：`default now()` 只在 INSERT 时生效；UPDATE 时不会自动变化。V1 由代码在更新任务状态/写入结果时显式设置 `updated_at = now()`（如后续需要可再加 trigger）。

### `verification_email_tasks`

任务（Job）内的单个邮箱执行单元。用于详情页列表展示（Email / Status / Detail / Last Update）。

#### 枚举类型

##### `task_email_status`

- 取值：`QUEUE` / `OBSERVING` / `SAFE` / `BOUNCE`
- 默认值：`QUEUE`

##### `task_email_detail`

用于详情页 “Detail” 列（由程序决定不同 Detail 的展示文案/tooltip 内容）。

- 取值（V1）：`AR_OUT_OF_OFFICE` / `AR_RESIGNED` / `AR_RECEIVE_CONFIRM` / `NO_SIGNAL_SO_FAR` / `B_ADDRESS_NOT_FOUND` / `B_REJECT`
- 可空：是（例如 `OBSERVING` 阶段展示 `-` 时可为 `null`）

#### 建表 SQL

```sql
create table public.verification_email_tasks (
  id uuid primary key default gen_random_uuid(),

  job_id uuid not null references public.verification_jobs(id) on delete cascade,

  email text not null,
  -- V1 规范化：trim + lower（上传时已去重，入库层再做一次幂等保险）
  email_normalized text generated always as (lower(trim(email))) stored,

  status public.task_email_status not null default 'QUEUE',
  detail public.task_email_detail null,
  -- Detail 的 tooltip 具体展示内容（由后台解析/汇总后写入，前端原样展示）
  detail_tooltip text null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- 幂等 key：同一个 job 内同一邮箱只允许一条记录
  unique (job_id, email_normalized)
);

create index verification_email_tasks_job_id_idx
  on public.verification_email_tasks (job_id);

create index verification_email_tasks_job_status_idx
  on public.verification_email_tasks (job_id, status);

create index verification_email_tasks_job_updated_at_idx
  on public.verification_email_tasks (job_id, updated_at desc);
```

#### 字段说明

- `status`：详情页 “Status” 列。
- `detail`：详情页 “Detail” 列（枚举值）。
- `detail_tooltip`：详情页 “Detail” 的 tooltip 文本；由模块 2（后台验证/结果解析）处理后写入，模块 1（本仓库的 Next.js）直接展示。
- `updated_at`：详情页 “Last Update”；更新 email task 结果时由代码显式写 `updated_at = now()`。

#### 变更 SQL（从旧版本升级）

如果你已经创建过表，需要补字段：

```sql
alter table public.verification_email_tasks
  add column if not exists detail_tooltip text null;
```
