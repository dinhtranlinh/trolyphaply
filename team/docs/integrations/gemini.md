# Gemini Integration

## Purpose

- Sinh câu trả lời Q&A và ShareText.

## Env

- `GEMINI_API_KEY` hoặc `GEMINI_API_KEY_1..n`
- `MODEL_NAME` (optional, mặc định `gemini-2.5-flash`)

## Usage rules

- Không log prompt có dữ liệu nhạy cảm.
- Có circuit breaker + cooldown trong `lib/gemini.ts`.
- ShareText dùng pool key riêng (2 key cuối).
- Có cache 24h (`lib/cache.ts`).

## Retry/timeout

- Q&A: một lần gọi chính + reprompt nếu fail cấu trúc.
- ShareText: timeout 6s, fallback local nếu fail.

## Verify

- `python team/scripts/verify/verify-gemini-key.py`
  - Kỳ vọng: request thành công, trả text.
