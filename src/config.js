const path = require("node:path");
const fs = require("node:fs");

const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const ENV_FILE = path.join(ROOT_DIR, ".env");

if (fs.existsSync(ENV_FILE)) {
  for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const entry = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (entry && process.env[entry[1]] === undefined) process.env[entry[1]] = entry[2].replace(/^(["'])(.*)\1$/, "$2");
  }
}

module.exports = { ROOT_DIR, PUBLIC_DIR, HOST: process.env.HOST || "localhost", PORT: Number.parseInt(process.env.PORT || "3000", 10), ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "", TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "", TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || "" };

