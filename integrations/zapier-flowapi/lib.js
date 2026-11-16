const base = (b) => (b.authData.host || 'https://flowapi.pro').replace(/\/+$/, '');
const url = (b, method) => `${base(b)}/waInstance${b.authData.idInstance}/${method}/${b.authData.apiTokenInstance}`;
const toChatId = (v) => { const s = String(v || '').trim(); return s.includes('@') ? s : `${s.replace(/\D/g, '')}@c.us`; };
const call = async (z, b, method, body, params) => {
  const r = await z.request({ url: url(b, method), method: body ? 'POST' : 'GET', body, params, skipThrowForStatus: true });
  if (r.status >= 400) throw new z.errors.Error(r.data?.message || `Flow API error ${r.status}`, 'FlowApiError', r.status);
  return r.data;
};
module.exports = { url, toChatId, call };
