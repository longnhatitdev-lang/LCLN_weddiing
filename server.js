const http = require("node:http");
const { HOST, PORT } = require("./src/config");
const { handleAdminRequest } = require("./src/admin-api");
const { handleTelegramRequest } = require("./src/telegram");
const { sendJson } = require("./src/http-utils");
const { serveStaticFile } = require("./src/static-server");

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url || "/", `http://${HOST}`).pathname;

  if (pathname.startsWith("/api/admin-")) {
    return handleAdminRequest(request, response, pathname);
  }
  if (pathname === "/api/telegram" && request.method === "POST") {
    return handleTelegramRequest(request, response);
  }
  if (pathname === "/api/telegram") {
    return sendJson(response, 405, { error: "Method Not Allowed" });
  }

  serveStaticFile(request, response);
});

server.listen(PORT, HOST, () => {
  console.log(`Wedding website running at http://${HOST}:${PORT}`);
});
