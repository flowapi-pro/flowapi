#!/bin/sh
# Send a WhatsApp text with Flow API (flowapi.pro). Set ID_INSTANCE and API_TOKEN first.
curl -s -X POST "https://flowapi.pro/waInstance$ID_INSTANCE/sendMessage/$API_TOKEN" \
  -H "content-type: application/json" \
  -d "{\"chatId\":\"${TO:-972501234567}@c.us\",\"message\":\"Hello from Flow API\"}"
echo
