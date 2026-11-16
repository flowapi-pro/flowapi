// Read incoming WhatsApp messages without a public URL (long polling). npm i flowapi
import { FlowApi, parseIncomingMessage } from "flowapi";

const wa = new FlowApi({ idInstance: process.env.ID_INSTANCE, apiTokenInstance: process.env.API_TOKEN });
console.log(await wa.getStateInstance());

for await (const body of wa.notifications({ receiveTimeout: 20 })) {
  const msg = parseIncomingMessage(body);
  if (msg) console.log(`${msg.senderName || msg.sender}: ${msg.text ?? `[${msg.type}]`}`);
}
