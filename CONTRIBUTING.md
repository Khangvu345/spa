# Hướng dẫn đóng góp

> Đọc file này trước khi bắt đầu code. Bao gồm cách setup môi trường,
> quy trình Git, và cách đồng bộ frontend subtree.

---

## Thiết lập môi trường lần đầu

### 1. Clone repo cha
```bash
git clone spa-management
cd spa-management
```

Backend và Documents, cũng như folder khác đã có sẵn trong repo — không cần thêm bước nào.


## Chạy local (không Docker)

### Backend — Node.js >= 24, TypeScript 5.x
```bash
cd backend
npm install
npm run start:dev
# API: http://localhost:8000
# Swagger: http://localhost:8000/api
```

### Frontend — Node.js 16, TypeScript 4.x

> ⚠️ Frontend yêu cầu **Node.js 16** do dùng base-web-umi legacy.  
> Dùng `fnm` để switch version: `fnm use 16` tương tự với Backend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

---
## Quy trình Git

### Branch naming
```
main        ← Production-ready, chỉ merge từ develop
develop     ← Integration branch
feature/    ← feature/booking-otp-17
fix/        ← fix/race-condition-slot-lock
chore/      ← chore/setup-docker-compose
docs/       ← docs/update-api-contract
```

### Commit message — Conventional Commits
```
#<issue-id> <type>(<scope>): <mô tả ngắn gọn>
```

| type | Khi nào dùng |
|---|---|
| `feat` | Tính năng mới |
| `fix` | Sửa bug |
| `refactor` | Refactor không đổi behavior |
| `docs` | Tài liệu |
| `chore` | Config, dependencies |
| `test` | Thêm/sửa test |

### Thứ tự commit trong 1 task (Issue #17 làm ví dụ)
```bash
#17 chore(env): add otp api base url
#17 docs(api): update booking otp contract
#17 test(booking): add otp service unit tests
#17 feat(booking): implement otp verify flow
#17 refactor(booking): extract otp validator
#17 docs(booking): add user guide for otp flow
```

Thứ tự: `chore` → `docs` → `test` → `feat/fix` → `refactor` → `docs`

### Quy tắc bắt buộc

- Không trộn nhiều mục tiêu trong 1 commit
- PR phải link đúng Issue
- Rebase với `develop` trước khi merge, resolve conflict, chạy test lại
- Dùng **Squash and merge** để lịch sử `develop` gọn

### Pull Request — bắt buộc review trước khi merge

PR description phải trả lời 3 câu: **Làm gì / Tại sao / Checklist lại các công việc khi test xong**
