# ZF青少年体能教务管理平台 - 微信小程序端（mobile-app）

本项目是 **ZF青少年体能教务管理平台** 的微信小程序前端（uni-app + Vue3），用于管理侧与家长侧移动端业务。

## 当前阶段
- 阶段1：管理侧核心3模块（登录 + 学员 + 课程）已完成基础实现并可编译。
- 阶段2：双角色闭环（家长侧 + JWT 演进 + 预约/签到/站内消息）按 OpenSpec 持续推进。

## 技术栈
- uni-app CLI
- Vue 3
- TypeScript
- uview-plus
- Vite

## 目录结构
```text
mobile-app/
├─ src/
│  ├─ pages/
│  ├─ api/
│  ├─ store/
│  ├─ utils/
│  ├─ manifest.json
│  └─ pages.json
├─ openspec/
│  ├─ changes/
│  └─ plans/
├─ package.json
└─ README.md
```

## 环境要求
- Node.js 18+
- npm 9+
- 微信开发者工具

## 安装与运行
```bash
npm install
npm run build:mp-weixin
```
构建产物目录：`dist/build/mp-weixin`

在微信开发者工具中导入 `dist/build/mp-weixin` 即可运行。

## 开发脚本
```bash
npm run dev:mp-weixin
npm run build:mp-weixin
npm run type-check
```

## 接口与鉴权（阶段1）
- 鉴权方式：HTTP Basic（与现有后端保持一致）
- 基础联调接口：
  - `GET /api/v1/public/ping`
  - `GET/POST/PUT /api/v1/students...`
  - `GET/POST/PUT /api/v1/courses...`

## OpenSpec 文档位置
- 总览：`openspec/README.md`
- 阶段1变更：`openspec/changes/mp-phase1-admin-core/`
- 阶段2变更：`openspec/changes/mp-phase2-dual-role-closed-loop/`

## 说明
- 表单支持草稿机制：除“取消”外默认保留草稿。
- 代码与规格按 OpenSpec 同步维护。
