const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = require("./config");
const { readBody, sendJson } = require("./http-utils");

async function handleTelegramRequest(request, response) {
  if (!token || !chatId || token.startsWith("replace_with_") || chatId.startsWith("replace_with_")) return sendJson(response, 503, { error: "Telegram chưa được cấu hình trên server." });
  let data;
  try { data = JSON.parse((await readBody(request, 8192)).toString()); } catch { return sendJson(response, 400, { error: "Dữ liệu JSON không hợp lệ." }); }
  const name = typeof data.name === "string" ? data.name.trim().slice(0, 100) : "";
  const side = data.side === "nha-trai" ? "Nhà trai" : data.side === "nha-gai" ? "Nhà gái" : "";
  const message = typeof data.message === "string" ? data.message.trim().slice(0, 1500) : "";
  if (!name || !side || !["wish", "rsvp"].includes(data.type)) return sendJson(response, 400, { error: "Thiếu hoặc sai thông tin." });
  let text = `💌 ${data.type === "wish" ? "LỜI CHÚC MỚI" : "XÁC NHẬN THAM DỰ"}\nTên: ${name}\nKhách: ${side}`;
  if (data.type === "rsvp") { if (!["yes", "no"].includes(data.status)) return sendJson(response, 400, { error: "Trạng thái không hợp lệ." }); const guests = data.status === "yes" ? Math.min(20, Math.max(1, Number(data.guests) || 1)) : 0; text += `\nTrạng thái: ${data.status === "yes" ? `Sẽ tham dự (${guests} khách)` : "Không tham dự"}`; }
  if (message) text += `\nLời nhắn: ${message}`;
  try { const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text }), signal: AbortSignal.timeout(10000) }); const result = await telegramResponse.json(); return sendJson(response, telegramResponse.ok && result.ok ? 200 : 502, telegramResponse.ok && result.ok ? { ok: true } : { error: "Telegram không gửi được tin nhắn." }); } catch { return sendJson(response, 502, { error: "Không kết nối được Telegram." }); }
}
module.exports = { handleTelegramRequest };

