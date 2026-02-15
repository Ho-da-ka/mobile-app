## Context

阶段2扩展为“管理侧 + 家长侧”并行，鉴权演进为 JWT 主路径并保持阶段1兼容。

## Backend Interfaces

- Auth:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
- Parent:
  - `GET /api/v1/parent/children`
  - `GET /api/v1/parent/courses`
  - `POST /api/v1/parent/bookings`
  - `DELETE /api/v1/parent/bookings/{id}`
  - `POST /api/v1/parent/checkins`
  - `GET /api/v1/parent/fitness-tests`
  - `GET /api/v1/parent/messages`
  - `PATCH /api/v1/parent/messages/{id}/read`

## Data Models

- `parent_account`
- `parent_student_relation`
- `course_booking`
- `in_app_message`
- refresh token 持久化结构

## Rules

- 家长仅访问绑定学员数据
- 预约容量控制与并发防超卖
- 签到幂等
- 消息已读幂等
