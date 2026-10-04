const fs = require("node:fs");
const path = require("node:path");
const { HOST, PUBLIC_DIR } = require("./config");
const { MIME_TYPES, sendJson } = require("./http-utils");

function getSafeFilePath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, `http://${HOST}`).pathname);
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(PUBLIC_DIR, `.${requestedPath}`);
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(`${PUBLIC_DIR}${path.sep}`)) return null;
  return filePath;
}

function serveStaticFile(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") return sendJson(response, 405, { error: "Method Not Allowed" });
  let filePath;
  try { filePath = getSafeFilePath(request.url || "/"); } catch { return sendJson(response, 400, { error: "Bad Request" }); }
  if (!filePath) return sendJson(response, 403, { error: "Forbidden" });
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) return sendJson(response, 404, { error: "Not Found" });
    response.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
    if (request.method === "HEAD") return response.end();
    fs.createReadStream(filePath).pipe(response);
  });
}

module.exports = { serveStaticFile };

