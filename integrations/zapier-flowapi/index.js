const authentication = require('./authentication');
const newMessage = require('./triggers/new_message');
const sendMessage = require('./creates/send_message');
const sendFile = require('./creates/send_file');
module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication,
  triggers: { [newMessage.key]: newMessage },
  creates: { [sendMessage.key]: sendMessage, [sendFile.key]: sendFile },
};
