## Why

当前 `mobile-app` 为空目录，尚无微信小程序工程与 OpenSpec 变更记录。后端已具备管理侧核心接口（登录鉴权、学员、课程），但移动端尚未形成可联调闭环。

## What Changes

- 新增阶段1变更：`mp-phase1-admin-core`
- 定义并实现管理侧核心功能范围：登录（HTTP Basic）、学员管理、课程管理（完整 CRUD）
- 统一请求封装与错误处理策略
- 增加表单草稿机制（取消清空，非取消保留）

## Capabilities

### Added Capabilities

- `admin-mobile-core`

## Impact

- 新增 `mobile-app` 小程序工程基础结构（uni-app Vue3）
- 依赖后端接口：`/api/v1/public/ping`、`/students`、`/courses`
- 不涉及后端数据库结构变更
