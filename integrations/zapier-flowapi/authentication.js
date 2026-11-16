const { call } = require('./lib');
module.exports = {
  type: 'custom',
  fields: [
    { key: 'idInstance', label: 'Instance ID', required: true, helpText: 'From the Credentials tab of your number in the [Flow API console](https://flowapi.pro/app).' },
    { key: 'apiTokenInstance', label: 'API Token', required: true, type: 'password' },
    { key: 'host', label: 'API URL', required: false, default: 'https://flowapi.pro' },
  ],
  test: async (z, b) => call(z, b, 'getStateInstance'),
  connectionLabel: (z, b) => `Instance ${b.authData.idInstance}`,
};
