# Verify Scripts

Rule:

- Mỗi integration/feature quan trọng phải có script verify.
- Script verify phải:
  - Load ENV
  - Validate required keys
  - Call minimal endpoint/action
  - Print PASS/FAIL + reason
  - Exit code: 0 pass, !=0 fail

Usage:

- `node team/scripts/verify/verify-env.mjs`
- `python team/scripts/verify/verify-db-connection.py`
- `python team/scripts/verify/verify-gemini-key.py`
- `python team/scripts/verify/verify-facebook-token.py`
- `python team/scripts/verify/verify-api-endpoints.py`
