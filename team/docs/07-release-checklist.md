# Release Checklist

Pre-release:

- [ ] Dev smoke test tại `http://localhost:3456`
- [ ] Contracts + migrations + docs cập nhật
- [ ] Verify scripts PASS
- [ ] Secrets scan PASS
- [ ] Changelog + session log cập nhật

Release (Prod):

- [ ] Sync dev -> prod (có thể dùng `scripts/deploy-to-prod.ps1`)
- [ ] `npm run build` tại prod folder
- [ ] Restart PM2: `npx pm2 restart trolyphaply-prod --update-env`

Post-release:

- [ ] Smoke test: Q&A, ShareText, Admin login, /admin/customers gate
- [ ] Facebook webhook/automation nếu đang bật
