# Contract Rules

## Single Source of Truth

- DB schema: `db-schema.md`
- Entities: `entities.md`
- API contracts: `api-contracts.md`
- Error codes: `error-codes.md`
- Validation rules: `data-validation.md`

## Rules

- Không đổi contract ngầm.
- Thêm/đổi field DB phải cập nhật `db-schema.md` + `entities.md` + migration.
- Thay đổi API input/output phải cập nhật `api-contracts.md` + `data-validation.md`.
- Integration mới phải có verify script trong `team/scripts/verify`.
