const { call, toChatId } = require('../lib');
module.exports = {
  key: 'send_message', noun: 'Message',
  display: { label: 'Send WhatsApp Message', description: 'Sends a text message to a phone number or group.' },
  operation: {
    inputFields: [
      { key: 'chat', label: 'Phone number or chat ID', required: true, helpText: 'Country code + number, e.g. 972501234567. Groups: …@g.us' },
      { key: 'message', label: 'Message', required: true, type: 'text' },
    ],
    perform: (z, b) => call(z, b, 'sendMessage', { chatId: toChatId(b.inputData.chat), message: b.inputData.message }),
    sample: { idMessage: '3EB0C1A7F2' },
  },
};
