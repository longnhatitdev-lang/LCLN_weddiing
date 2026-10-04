const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { PUBLIC_DIR, ADMIN_PASSWORD } = require("./config");
const { isAuthorized, readBody, sendJson } = require("./http-utils");
const IMAGE_RE = /\.(png|jpe?g|webp|gif|avif)$/i;
function collectImages(rootDir, urlPrefix) {
  if (!fs.existsSync(rootDir)) return [];
  const result = [];
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const full = path.join(rootDir, entry.name);
    if (entry.isDirectory()) result.push(...collectImages(full, urlPrefix + "/" + entry.name));
    else if (IMAGE_RE.test(entry.name)) result.push(urlPrefix + "/" + entry.name);
  }
  return result.sort();
}
async function handleAdminRequest(request, response, route) {
  if (!ADMIN_PASSWORD) return sendJson(response, 503, { error: "Chưa cấu hình ADMIN_PASSWORD trong .env" });
  if (!isAuthorized(request, ADMIN_PASSWORD)) return sendJson(response, 401, { error: "Sai mật khẩu quản trị" });
  try {
    if (route === "/api/admin-images" && request.method === "GET") {
      const uploads = collectImages(path.join(PUBLIC_DIR, "uploads"), "/uploads");
      const assets = collectImages(path.join(PUBLIC_DIR, "asset"), "/asset");
      return sendJson(response, 200, { images: [...uploads, ...assets] });
    }
    if (route === "/api/admin-html" && request.method === "GET") return sendJson(response, 200, { ok: true });
    if (route === "/api/admin-html" && request.method === "PUT") {
      const html = (await readBody(request)).toString();
      if (!html.includes("<html") || html.length > 10 * 1024 * 1024) return sendJson(response, 400, { error: "HTML không hợp lệ" });
      fs.writeFileSync(path.join(PUBLIC_DIR, "index.html"), html, "utf8");
      return sendJson(response, 200, { ok: true });
    }
    if (route === "/api/admin-upload" && request.method === "POST") {
      const data = JSON.parse((await readBody(request)).toString());
      const match = String(data.dataUrl || "").match(/^data:image\/(png|jpeg|webp|gif);base64,([\w+/=]+)$/);
      if (!match) return sendJson(response, 400, { error: "Ảnh không hợp lệ" });
      const dir = path.join(PUBLIC_DIR, "uploads"); fs.mkdirSync(dir, { recursive: true });
      const ext = match[1] === "jpeg" ? "jpg" : match[1], name = `image-${Date.now()}-${crypto.randomBytes(3).toString("hex")}.${ext}`;
      fs.writeFileSync(path.join(dir, name), Buffer.from(match[2], "base64"));
      return sendJson(response, 201, { url: `/uploads/${name}` });
    }
    return sendJson(response, 405, { error: "Method Not Allowed" });
  } catch (error) { return sendJson(response, 400, { error: error.message }); }
}
module.exports = { handleAdminRequest };
