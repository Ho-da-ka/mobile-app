# OpenSpec（mobile-app）

本目录用于管理 `mobile-app`（uni-app 微信小程序）的需求、设计与实施任务，采用 OpenSpec 分阶段推进。

## 目标

围绕 ZF 青少年体能培训教务平台移动端，按两阶段落地：

1. 阶段1：管理侧核心 3 模块真联调（登录 + 学员 + 课程，完整 CRUD，HTTP Basic）
2. 阶段2：扩展后端后实现双角色闭环（管理侧 + 家长侧，JWT）

## 目录约定

- `changes/`：进行中的变更提案（proposal/design/tasks/specs）
- `specs/`：稳定能力基线（归档后沉淀）

## 当前规划中的变更

1. `mp-phase1-admin-core`
2. `mp-phase2-dual-role-closed-loop`

## 本项目固定决策（已锁定）

- 根目录：`Code/mobile-app`
- 工程：`uni-app CLI + Vue3`
- UI：`uview-plus`
- 仓库策略：`mobile-app` 独立仓库
- 联调：先微信开发者工具本地联调
- 阶段1鉴权：HTTP Basic
- 阶段2鉴权：JWT（并保持阶段1兼容）

## 工作方式（严格执行）

每次仅产出一个中间文件草案，需确认后再进入下一文件。
