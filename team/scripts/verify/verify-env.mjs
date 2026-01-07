import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const cwd = process.cwd();

const loadEnvFile = (filename) => {
  const filePath = path.join(cwd, filename);
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override: false });
  }
};

loadEnvFile(".env");
loadEnvFile(".env.local");

const missing = [];
const warnings = [];

const requireKey = (key, reason) => {
  const value = process.env[key];
  if (!value || String(value).trim().length === 0) {
    missing.push(`${key}${reason ? ` (${reason})` : ""}`);
  }
};

const requireOneOf = (keys, reason) => {
  const hasAny = keys.some((k) => {
    const value = process.env[k];
    return value && String(value).trim().length > 0;
  });
  if (!hasAny) {
    missing.push(`${keys.join(" | ")}${reason ? ` (${reason})` : ""}`);
  }
};

requireKey("NEXT_PUBLIC_SUPABASE_URL", "Supabase URL");
requireKey("NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase anon key");
requireKey("SUPABASE_SERVICE_ROLE_KEY", "Supabase service role key");
requireOneOf(["DATABASE_URL", "DIRECT_URL"], "Postgres connection");
requireKey("NEXT_PUBLIC_APP_URL", "App base URL");

requireKey("ADMIN_EMAIL", "Admin login");
requireOneOf(["ADMIN_PASSWORD_HASH", "ADMIN_PASSWORD"], "Admin password");

requireKey("ADMIN_CUSTOMERS_SESSION_SECRET", "Admin customers gate");
requireKey("ADMIN_CUSTOMERS_TOTP_SECRET", "Admin customers 2FA");
requireOneOf(["ADMIN_CUSTOMERS_PIN", "ADMIN_CUSTOMERS_PIN_HASH"], "Admin customers PIN");
requireKey("ADMIN_CUSTOMERS_ALLOWED_IPS", "Admin customers allowlist IPs");
requireKey("ADMIN_CUSTOMERS_ALLOWED_HOSTS", "Admin customers allowlist hosts");
requireKey("ADMIN_CUSTOMERS_PHONE_KEY", "Phone encryption key");
requireKey("ADMIN_CUSTOMERS_PHONE_HMAC_KEY", "Phone hash key");

requireOneOf(
  [
    "GEMINI_API_KEY",
    "GEMINI_API_KEY_1",
    "GEMINI_API_KEY_2",
    "GEMINI_API_KEY_3",
    "GEMINI_API_KEY_4",
    "GEMINI_API_KEY_5",
    "GEMINI_API_KEY_6",
    "GEMINI_API_KEY_7"
  ],
  "Gemini API key"
);

const hasFacebookEnv =
  Boolean(process.env.FACEBOOK_APP_ID) ||
  Boolean(process.env.FACEBOOK_APP_SECRET) ||
  Boolean(process.env.FACEBOOK_VERIFY_TOKEN);

if (hasFacebookEnv) {
  requireKey("FACEBOOK_APP_ID", "Facebook App");
  requireKey("FACEBOOK_APP_SECRET", "Facebook App");
  requireKey("FACEBOOK_VERIFY_TOKEN", "Webhook verify token");
  requireKey("FACEBOOK_TOKEN_ENCRYPTION_KEY", "Token encryption");
}

if (missing.length > 0) {
  console.error("FAIL: Missing required ENV keys:");
  missing.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn("WARN:");
  warnings.forEach((item) => console.warn(`- ${item}`));
}

console.log("PASS: ENV looks OK");
process.exit(0);
