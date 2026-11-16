# Flow API (flowapi.pro) — WhatsApp HTTP API for automations and AI agents

**Flow API** ([flowapi.pro](https://flowapi.pro)) lets you send and receive WhatsApp messages from your own number with simple HTTP requests, webhooks, Make, n8n, Zapier, or an MCP server for AI agents like Claude and ChatGPT. Link a number by scanning a QR code, no Meta approval and no message templates.

- **Green API compatible:** same method names, request bodies and webhook format. Moving from Green API is a one-line change of the base URL.
- **Price:** $10 per number per month, $100 per number per year, or $400 a year for five numbers. Unlimited messages. 7-day free trial, no credit card.
- **Integrations:** Make, n8n (community node + trigger), Zapier, MCP for Claude, ChatGPT, Codex, Cursor, Grok.
- **WhatsApp calls (beta):** make and receive WhatsApp voice calls by API or in the browser, with optional recording.

> Name note: "Flow API" here means Flow API (flowapi.pro), an independent product by DispatchioAI LLC. It is not Meta's "WhatsApp Flows" / "Flows API", and it is not affiliated with WhatsApp or Meta.

## Start in one minute

1. Sign up at [flowapi.pro](https://flowapi.pro), create a number and scan the QR code with WhatsApp (Settings → Linked devices).
2. Copy your **idInstance** and **apiTokenInstance** from the Credentials tab.
3. Send a message:

```bash
curl -X POST "https://flowapi.pro/waInstance$ID_INSTANCE/sendMessage/$API_TOKEN" \
  -H "content-type: application/json" \
  -d '{"chatId":"972501234567@c.us","message":"Hello from Flow API"}'
```

Every request has the form `https://flowapi.pro/waInstance{idInstance}/{method}/{apiTokenInstance}`. Read methods use GET, everything else POST with a JSON body. A `chatId` is `<country code + number>@c.us` for a person and `<id>@g.us` for a group.

## JavaScript SDK

Zero dependencies, works in Node 18+, Deno, Bun and edge runtimes.

```bash
npm install github:flowapi-pro/flowapi#main   # npm package "flowapi" coming soon
```

```js
import { FlowApi, parseIncomingMessage } from "flowapi";

const wa = new FlowApi({ idInstance: process.env.ID_INSTANCE, apiTokenInstance: process.env.API_TOKEN });

await wa.sendMessage("+972 50-123-4567", "Your order has shipped");
await wa.sendFileByUrl("972501234567", "https://example.com/invoice.pdf", "invoice.pdf", "Your invoice");
const { existsWhatsapp } = await wa.checkWhatsapp("972501234567");

// Receive without a public URL (long polling)
for await (const body of wa.notifications()) {
  const msg = parseIncomingMessage(body);
  if (msg?.text?.toLowerCase() === "ping") await wa.sendMessage(msg.chatId, "pong");
}
```

The SDK is in [`sdk/js`](sdk/js). It retries HTTP 429 using the `Retry-After` header and also works against any Green API style host with `{ baseUrl }`.

## Receive messages

- **Webhook:** `POST .../setSettings` with `{"webhookUrl":"https://your-server/hook"}`. Incoming messages arrive as `incomingMessageReceived` (same format as Green API). See [`examples/webhook-express.mjs`](examples/webhook-express.mjs).
- **Long polling:** `GET .../receiveNotification?receiveTimeout=20`, then `DELETE .../deleteNotification/{receiptId}`. See [`examples/long-polling.mjs`](examples/long-polling.mjs).

## Methods

| Area | Methods |
| --- | --- |
| Account | getStateInstance, getSettings, setSettings |
| Send | sendMessage, sendFileByUrl, sendLocation, sendContact, sendPoll, sendTyping |
| Receive | receiveNotification, deleteNotification, lastIncomingMessages, lastOutgoingMessages, getChatHistory, readChat |
| Contacts & groups | checkWhatsapp, getContactInfo, getContacts, createGroup, getGroupData, addGroupParticipant |
| Calls (beta) | callsDial, callsAccept, callsReject, callsHangUp, callsState, callsGetRecording, callsSetRecording, lastIncomingCalls, lastOutgoingCalls |

Full reference: [flowapi.pro/docs](https://flowapi.pro/docs) · OpenAPI 3.1 spec: [`openapi/openapi.json`](openapi/openapi.json) (live copy at [flowapi.pro/openapi.json](https://flowapi.pro/openapi.json)).

Rate limits per number: 300 API calls per minute; 60 messages per minute, 2,000 per hour, 20,000 per day. Over the limit you get HTTP 429 with `Retry-After`.

## AI agents (MCP)

Every number has its own MCP server (Streamable HTTP):

```
https://flowapi.pro/mcp/{idInstance}/{apiTokenInstance}
```

Tools: `whatsapp_status`, `send_message`, `send_file`, `send_location`, `send_poll`, `check_whatsapp`, `list_chats`, `get_chat_history`, `get_new_messages`, `mark_as_read`, `get_contact_info`, `create_group`. Setup for Claude, ChatGPT, Codex, Cursor, n8n AI Agent and Grok: [`mcp/README.md`](mcp/README.md).

## No-code

- **Make:** [flowapi.pro/integrations/make](https://flowapi.pro/integrations/make) — ready scenario blueprints.
- **n8n:** community node with a WhatsApp trigger, source in [`integrations/n8n-nodes-flowapi`](integrations/n8n-nodes-flowapi).
- **Zapier:** instant new-message trigger and send actions, source in [`integrations/zapier-flowapi`](integrations/zapier-flowapi).

## Moving from Green API

Replace `https://api.green-api.com` (or your `7103.api.greenapi.com` style host) with `https://flowapi.pro` and use your Flow API idInstance and token. Method names, bodies and webhooks stay the same, so existing Green API SDKs and Make / n8n modules keep working. Details: [flowapi.pro/green-api-alternative](https://flowapi.pro/green-api-alternative).

## FAQ

**Is this the official WhatsApp Business API?** No. Flow API links a regular WhatsApp or WhatsApp Business app number as a device, like WhatsApp Web. Use Meta's official platform if you need template broadcasts at very large scale; use Flow API when you want your own number working in automations today.

**Can my number get banned?** WhatsApp can restrict any number that sends spam. Only message people who expect to hear from you and pace your sends.

**Support:** contact@flowapi.pro · [flowapi.pro/contact](https://flowapi.pro/contact)

## License

The SDK, examples and integration source in this repository are MIT licensed. Flow API itself is a hosted service: see the [Terms](https://flowapi.pro/legal/terms).
