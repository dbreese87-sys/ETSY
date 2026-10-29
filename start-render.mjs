const required = ["ALURA_API_KEY", "APP_PASSWORD", "APP_SESSION_SECRET"];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length) {
  console.error(`Set these private Render environment values before starting: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.APP_PASSWORD.length < 16) {
  console.error("APP_PASSWORD must be at least 16 characters.");
  process.exit(1);
}

const publicUrl = process.env.PUBLIC_BASE_URL || process.env.RENDER_EXTERNAL_URL;
if (!publicUrl?.startsWith("https://")) {
  console.error("The hosted app needs its HTTPS address in PUBLIC_BASE_URL.");
  process.exit(1);
}

process.env.HOST = "0.0.0.0";
process.env.PUBLIC_BASE_URL = publicUrl.replace(/\/+$/, "");

await import("./server.mjs");
