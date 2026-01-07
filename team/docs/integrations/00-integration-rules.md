# Integration Rules

- Mỗi integration phải có:
  - Danh sách ENV
  - Flow auth/token
  - Rate limit + retry policy
  - Verify script trong `team/scripts/verify`
- Không merge integration nếu verify script chưa pass.
- Không log token/PII.
