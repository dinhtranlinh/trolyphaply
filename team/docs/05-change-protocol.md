# Change Protocol (Giao thức thay đổi)

## 0) Scope lock

- Mỗi phiên tối đa 1-3 hạng mục.
- Không sửa ngoài phạm vi đã xác nhận.

## 1) Đọc bắt buộc trước khi làm

- `team/docs/00-project-constitution.md`
- `team/docs/contracts/*`
- `team/docs/04-versions-lock.md`
- `team/docs/08-known-issues.md`
- `team/docs/changelog/changelog.md`
- ADR liên quan (nếu có)

## 2) Quy trình patch

Patch = thay đổi nhỏ có kiểm chứng.

Template patch:

- Goal:
- Files to change:
- Contracts impacted:
- DB migration:
- Verify scripts/tests:
- Done when:

## 3) Thứ tự bắt buộc

Contract/Migration -> Verify script -> Implement -> Docs/Changelog.

## 4) Không được phép

- Không hardcode secrets.
- Không đổi schema/field ngầm.
- Không sửa ngoài scope.

## 5) Dev -> Prod

- Dev hoàn tất và test ở `D:\DTL\trolyphaply` (port 3456).
- Sync sang prod `D:\DTL\trolyphaply-prod-release`.
- Build + restart `trolyphaply-prod` (PM2).
