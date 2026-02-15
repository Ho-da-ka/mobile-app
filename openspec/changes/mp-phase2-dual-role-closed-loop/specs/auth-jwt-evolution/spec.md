## ADDED Requirements

### Requirement: JWT login for multi-role users
系统 MUST 提供基于 JWT 的登录能力，并支持 ADMIN/COACH/PARENT。

### Requirement: Access token refresh
系统 MUST 提供刷新 access token 的能力。

### Requirement: Logout and token revocation
系统 MUST 支持退出登录并失效会话令牌。

### Requirement: Protected API authorization
系统 MUST 对受保护接口执行 JWT 鉴权与角色授权校验。

### Requirement: Basic compatibility during transition
系统 MUST 在阶段迁移期间保持 Basic 兼容路径，避免阶段1能力回归。
