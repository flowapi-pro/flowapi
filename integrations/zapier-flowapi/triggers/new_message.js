// REST hook: subscribing points the Flow API instance webhook at Zapier.
const { call } = require('../lib');
const shape = (n) => {
  const md = n.messageData || {}; const sd = n.senderData || {};
  return {
    id: n.idMessage, type: n.typeWebhook, chat_id: sd.chatId, sender: sd.sender, sender_name: sd.senderName,
    message_type: md.typeMessage,
    text: md.textMessageData?.textMessage ?? md.extendedTextMessageData?.text ?? md.fileMessageData?.caption ?? '',
    file_url: md.fileMessageData?.downloadUrl || null, timestamp: n.timestamp, raw: n,
  };
};
module.exports = {
  key: 'new_message', noun: 'Message',
  display: { label: 'New Incoming WhatsApp Message', description: 'Triggers when your WhatsApp number receives a message.' },
  operation: {
    type: 'hook',
    inputFields: [{ key: 'ignore_groups', label: 'Ignore group messages', type: 'boolean', default: 'true' }],
    performSubscribe: async (z, b) => { await call(z, b, 'setSettings', { webhookUrl: b.targetUrl, incomingWebhook: 'yes' }); return { url: b.targetUrl }; },
    performUnsubscribe: async (z, b) => { await call(z, b, 'setSettings', { webhookUrl: '' }); return {}; },
    perform: async (z, b) => {
      const n = b.cleanedRequest; if (n.typeWebhook !== 'incomingMessageReceived') return [];
      const m = shape(n);
      if (String(b.inputData.ignore_groups) !== 'false' && String(m.chat_id).endsWith('@g.us')) return [];
      return [m];
    },
    performList: async (z, b) => {
      const r = await call(z, b, 'lastIncomingMessages', undefined, { minutes: 1440 });
      return (Array.isArray(r) ? r : []).slice(0, 3).map((m) => ({ id: m.idMessage, type: 'incomingMessageReceived', chat_id: m.chatId, sender: m.senderId, sender_name: m.senderName, message_type: m.typeMessage, text: m.textMessage, file_url: m.downloadUrl || null, timestamp: m.timestamp }));
    },
    sample: { id: '3EB0C1A7F2', type: 'incomingMessageReceived', chat_id: '972501234567@c.us', sender: '972501234567@c.us', sender_name: 'Dana', message_type: 'textMessage', text: 'Hi, is my order ready?', file_url: null, timestamp: 1791819789 },
  },
};
