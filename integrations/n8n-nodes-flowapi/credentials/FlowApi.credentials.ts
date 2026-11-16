import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class FlowApi implements ICredentialType {
	name = 'flowApi';
	displayName = 'Flow API';
	documentationUrl = 'https://flowapi.pro/integrations';
	properties: INodeProperties[] = [
		{ displayName: 'Instance ID', name: 'idInstance', type: 'string', default: '', required: true, description: 'idInstance from the Credentials tab in the Flow API console' },
		{ displayName: 'API Token', name: 'apiTokenInstance', type: 'string', typeOptions: { password: true }, default: '', required: true },
		{ displayName: 'API URL', name: 'host', type: 'string', default: 'https://flowapi.pro', description: 'Leave as is unless you self-host' },
	];
	authenticate: IAuthenticateGeneric = { type: 'generic', properties: {} };
	test: ICredentialTestRequest = {
		request: { baseURL: '={{$credentials.host}}', url: '=/waInstance{{$credentials.idInstance}}/getStateInstance/{{$credentials.apiTokenInstance}}', method: 'GET' },
	};
}
