## Context

阶段1目标是让微信小程序管理侧具备真实可联调的核心业务能力。后端当前可用能力以 HTTP Basic 为主，且学员/课程接口已稳定。

## Goals

- 初始化 uni-app（Vue3 + TS）工程
- 完成登录、学员、课程页面路由与 CRUD
- 建立统一网络层与 Basic 鉴权注入
- 实现草稿策略（取消清空，非取消恢复）

## Non-Goals

- 不实现家长侧流程（阶段2）
- 不改后端为 JWT（阶段2）

## Architecture

- 页面：
  - `pages/login/index`
  - `pages/admin/home`
  - `pages/admin/students/{list,form,detail}`
  - `pages/admin/courses/{list,form,detail}`
- API 层：`api/http` + `api/modules/{auth,students,courses}`
- 状态：`store/auth`
- 工具：`utils/{draft,validators,error}`

## Key Decisions

1. 阶段1使用 Basic，阶段2再迁移 JWT
2. 草稿策略与管理后台保持一致
3. 先构建 API 层再搭页面

## Acceptance Criteria

1. 登录成功进入首页
2. 学员 CRUD 全链路通过
3. 课程 CRUD 全链路通过
4. 401/403/409/500 反馈正确
5. 草稿策略符合规则
