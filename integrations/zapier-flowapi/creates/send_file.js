const { call, toChatId } = require('../lib');
module.exports = {
  key: 'send_file', noun: 'File',
  display: { label: 'Send WhatsApp File', description: 'Sends an image, PDF, video or document from a URL.' },
  operation: {
    inputFields: [
      { key: 'chat', label: 'Phone number or chat ID', required: true },
      { key: 'url', label: 'File URL', required: true },
      { key: 'file_name', label: 'File name', required: true, helpText: 'Include the extension, e.g. invoice.pdf' },
      { key: 'caption', label: 'Caption', required: false, type: 'text' },
    ],
    perform: (z, b) => call(z, b, 'sendFileByUrl', { chatId: toChatId(b.inputData.chat), urlFile: b.inputData.url, fileName: b.inputData.file_name, caption: b.inputData.caption || '' }),
    sample: { idMessage: '7A11F2D09C' },
  },
};
