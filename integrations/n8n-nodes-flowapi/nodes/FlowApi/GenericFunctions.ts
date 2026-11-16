import type { IDataObject, IExecuteFunctions, IHookFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function flowApiRequest(this: IExecuteFunctions | IHookFunctions, method: IHttpRequestMethods, apiMethod: string, body?: IDataObject, qs?: IDataObject): Promise<any> {
	const c = await this.getCredentials('flowApi');
	const host = String(c.host || 'https://flowapi.pro').replace(/\/+$/, '');
	return this.helpers.httpRequest({ method, url: `${host}/waInstance${c.idInstance}/${apiMethod}/${c.apiTokenInstance}`, body, qs, json: true });
}

/** Accept a plain phone number or a chat id. */
export function toChatId(v: string): string {
	const s = String(v || '').trim();
	return s.includes('@') ? s : `${s.replace(/\D/g, '')}@c.us`;
}
