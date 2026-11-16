# flowapi — JavaScript SDK for Flow API (flowapi.pro)

Send and receive WhatsApp messages from your own number over HTTP. Green API compatible, zero dependencies, Node 18+.

```js
import { FlowApi } from "flowapi";
const wa = new FlowApi({ idInstance: "1101000000", apiTokenInstance: "your-token" });
await wa.sendMessage("972501234567", "Hello");
```

Docs and examples: https://github.com/flowapi-pro/flowapi · API reference: https://flowapi.pro/docs
