# Flow API (flowapi.pro) MCP server: give an AI agent a WhatsApp number

Each Flow API number has its own remote MCP server (Streamable HTTP). Replace the two values with your idInstance and apiTokenInstance from the Credentials tab.

```
https://flowapi.pro/mcp/{idInstance}/{apiTokenInstance}
```

Tools: whatsapp_status, send_message, send_file, send_location, send_poll, check_whatsapp, list_chats, get_chat_history, get_new_messages, mark_as_read, get_contact_info, create_group.

## Claude (app and web)
Settings → Connectors → Add custom connector → paste the link. Guide: https://flowapi.pro/guides/connect-whatsapp-to-claude

## Claude Code
```bash
claude mcp add --transport http whatsapp https://flowapi.pro/mcp/{idInstance}/{apiTokenInstance}
```

## Cursor / VS Code (`.cursor/mcp.json` or `.vscode/mcp.json`)
```json
{ "mcpServers": { "whatsapp": { "url": "https://flowapi.pro/mcp/{idInstance}/{apiTokenInstance}" } } }
```

## OpenAI Codex CLI (`~/.codex/config.toml`)
```toml
[mcp_servers.whatsapp]
command = "npx"
args = ["-y", "mcp-remote", "https://flowapi.pro/mcp/{idInstance}/{apiTokenInstance}"]
```

## ChatGPT
Add a connector with the MCP link (developer mode), or build a custom GPT action from https://flowapi.pro/openapi.json. Guide: https://flowapi.pro/integrations/chatgpt

## xAI Grok API
```json
{ "type": "mcp", "server_url": "https://flowapi.pro/mcp/{idInstance}/{apiTokenInstance}", "server_label": "whatsapp" }
```

## n8n AI Agent
Add an "MCP Client Tool" to the AI Agent node, paste the link as the endpoint and choose transport "HTTP Streamable".

Keep the link private: it contains your API token. You can rotate the token in the Flow API console.
