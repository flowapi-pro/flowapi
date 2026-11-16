// Flow API (flowapi.pro) JavaScript SDK. Zero dependencies, Node 18+, Deno, Bun and browsers (fetch).
// Every request: https://flowapi.pro/waInstance{idInstance}/{method}/{apiTokenInstance}
// Green API compatible: pass { baseUrl } to point at another Green API style host.

export class FlowApiError extends Error {
  constructor(message, status, body) { super(message); this.name = "FlowApiError"; this.status = status; this.body = body; }
}

/** Turn a phone number ("+972 50-123-4567") or chat ID into a chatId ("972501234567@c.us"). Group IDs (@g.us) pass through. */
export function toChatId(v) {
  const s = String(v).trim();
  if (s.includes("@")) return s;
  return s.replace(/\D/g, "") + "@c.us";
}

export class FlowApi {
  /**
   * @param {{ idInstance: string|number, apiTokenInstance: string, baseUrl?: string, retries?: number, fetch?: typeof fetch }} opts
   */
  constructor({ idInstance, apiTokenInstance, baseUrl = "https://flowapi.pro", retries = 2, fetch: f } = {}) {
    if (!idInstance || !apiTokenInstance) throw new Error("idInstance and apiTokenInstance are required (Flow API console, Credentials tab)");
    this.idInstance = String(idInstance);
    this.token = String(apiTokenInstance);
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.retries = retries;
    this.fetch = f || globalThis.fetch;
  }

  url(method) { return `${this.baseUrl}/waInstance${this.idInstance}/${method}/${this.token}`; }

  /** Call any API method. GET when body is undefined, POST with JSON otherwise. Retries HTTP 429 using Retry-After. */
  async call(method, body, { query } = {}) {
    let u = this.url(method);
    if (query) u += "?" + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]));
    for (let attempt = 0; ; attempt++) {
      const res = await this.fetch(u, body === undefined ? { method: "GET" } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const text = await res.text();
      let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
      if (res.status === 429 && attempt < this.retries) {
        const wait = Math.min(Number(res.headers.get("retry-after")) || 5, 60);
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }
      if (!res.ok) throw new FlowApiError((data && data.message) || `HTTP ${res.status} from ${method}`, res.status, data);
      return data;
    }
  }

  // ---- account ----
  getStateInstance() { return this.call("getStateInstance"); }
  getSettings() { return this.call("getSettings"); }
  /** e.g. setSettings({ webhookUrl: "https://example.com/hook", incomingWebhook: "yes" }) */
  setSettings(settings) { return this.call("setSettings", settings); }

  // ---- sending ----
  sendMessage(chat, message, extra = {}) { return this.call("sendMessage", { chatId: toChatId(chat), message, ...extra }); }
  sendFileByUrl(chat, urlFile, fileName, caption, extra = {}) { return this.call("sendFileByUrl", { chatId: toChatId(chat), urlFile, fileName, ...(caption ? { caption } : {}), ...extra }); }
  sendLocation(chat, latitude, longitude, extra = {}) { return this.call("sendLocation", { chatId: toChatId(chat), latitude, longitude, ...extra }); }
  sendContact(chat, contact) { return this.call("sendContact", { chatId: toChatId(chat), contact }); }
  /** options: array of strings */
  sendPoll(chat, message, options, multipleAnswers = false) { return this.call("sendPoll", { chatId: toChatId(chat), message, options: options.map((o) => (typeof o === "string" ? { optionName: o } : o)), multipleAnswers }); }
  sendTyping(chat) { return this.call("sendTyping", { chatId: toChatId(chat) }); }

  // ---- receiving ----
  /** Long-poll the next notification (null when the queue is empty). Call deleteNotification(receiptId) after handling it. */
  receiveNotification(receiveTimeout = 20) { return this.call("receiveNotification", undefined, { query: { receiveTimeout } }); }
  deleteNotification(receiptId) { return this.fetch(`${this.url("deleteNotification")}/${receiptId}`, { method: "DELETE" }).then((r) => r.json()); }
  /** Async iterator over incoming notifications using long polling. Each one is deleted after your loop body runs. */
  async *notifications({ receiveTimeout = 20, signal } = {}) {
    while (!signal?.aborted) {
      const n = await this.receiveNotification(receiveTimeout);
      if (!n) continue;
      try { yield n.body; } finally { await this.deleteNotification(n.receiptId); }
    }
  }
  lastIncomingMessages(minutes = 1440) { return this.call("lastIncomingMessages", undefined, { query: { minutes } }); }
  lastOutgoingMessages(minutes = 1440) { return this.call("lastOutgoingMessages", undefined, { query: { minutes } }); }
  getChatHistory(chat, count = 50) { return this.call("getChatHistory", { chatId: toChatId(chat), count }); }
  readChat(chat) { return this.call("readChat", { chatId: toChatId(chat) }); }

  // ---- contacts and groups ----
  checkWhatsapp(phoneNumber) { return this.call("checkWhatsapp", { phoneNumber: Number(String(phoneNumber).replace(/\D/g, "")) }); }
  getContactInfo(chat) { return this.call("getContactInfo", { chatId: toChatId(chat) }); }
  getContacts() { return this.call("getContacts"); }
  createGroup(groupName, members) { return this.call("createGroup", { groupName, chatIds: members.map(toChatId) }); }
  getGroupData(groupId) { return this.call("getGroupData", { groupId }); }
  addGroupParticipant(groupId, participant) { return this.call("addGroupParticipant", { groupId, participantChatId: toChatId(participant) }); }

  /** MCP server link for AI agents (Claude, ChatGPT, Cursor, n8n AI Agent). */
  mcpUrl() { return `${this.baseUrl}/mcp/${this.idInstance}/${this.token}`; }
}

/** Pull the useful parts out of an incoming-message webhook body. Returns null for other webhook types. */
export function parseIncomingMessage(body) {
  if (!body || body.typeWebhook !== "incomingMessageReceived") return null;
  const md = body.messageData || {};
  const text = md.textMessageData?.textMessage ?? md.extendedTextMessageData?.text ?? md.fileMessageData?.caption ?? null;
  return {
    idMessage: body.idMessage, timestamp: body.timestamp, chatId: body.senderData?.chatId, sender: body.senderData?.sender,
    senderName: body.senderData?.senderName, type: md.typeMessage, text, fileUrl: md.fileMessageData?.downloadUrl ?? null, raw: body,
  };
}

export default FlowApi;
