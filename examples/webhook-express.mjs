// Receive WhatsApp messages on a webhook and auto-reply. npm i express flowapi
// Then point your number at it: await wa.setSettings({ webhookUrl: "https://your-server/hook" })
import express from "express";
import { FlowApi, parseIncomingMessage } from "flowapi";

const wa = new FlowApi({ idInstance: process.env.ID_INSTANCE, apiTokenInstance: process.env.API_TOKEN });
const app = express();
app.use(express.json({ limit: "5mb" }));

app.post("/hook", async (req, res) => {
  res.sendStatus(200);                    // answer fast; do the work after
  const msg = parseIncomingMessage(req.body);
  if (!msg || !msg.text) return;
  if (/price|cost/i.test(msg.text)) await wa.sendMessage(msg.chatId, "Plans start at $10 per month. Want a link?");
});

app.listen(3000, () => console.log("Listening on :3000/hook"));
