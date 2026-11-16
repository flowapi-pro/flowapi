import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { flowApiRequest, toChatId } from './GenericFunctions';

const chatField = (ops: string[]) => ({
	displayName: 'Chat (phone or chat ID)', name: 'chatId', type: 'string' as const, default: '', required: true,
	placeholder: '972501234567 or 972501234567@c.us',
	description: 'Phone number with country code, or a chat ID (…@c.us for people, …@g.us for groups)',
	displayOptions: { show: { operation: ops } },
});

export class FlowApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Flow API (WhatsApp)',
		name: 'flowApi',
		icon: 'file:flowapi.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Send and read WhatsApp messages with Flow API',
		defaults: { name: 'Flow API' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'flowApi', required: true }],
		properties: [
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true, default: 'sendMessage',
				options: [
					{ name: 'Send Text Message', value: 'sendMessage', action: 'Send a text message' },
					{ name: 'Send File by URL', value: 'sendFileByUrl', action: 'Send a file by URL' },
					{ name: 'Send Location', value: 'sendLocation', action: 'Send a location' },
					{ name: 'Send Poll', value: 'sendPoll', action: 'Send a poll' },
					{ name: 'Get Chat History', value: 'getChatHistory', action: 'Get chat history' },
					{ name: 'Get Incoming Messages', value: 'lastIncomingMessages', action: 'Get recent incoming messages' },
					{ name: 'Mark Chat as Read', value: 'readChat', action: 'Mark a chat as read' },
					{ name: 'Check WhatsApp Number', value: 'checkWhatsapp', action: 'Check if a number has whatsapp' },
					{ name: 'Get Contact Info', value: 'getContactInfo', action: 'Get contact info' },
					{ name: 'Get Connection State', value: 'getStateInstance', action: 'Get connection state' },
				],
			},
			chatField(['sendMessage', 'sendFileByUrl', 'sendLocation', 'sendPoll', 'getChatHistory', 'readChat', 'getContactInfo']),
			{ displayName: 'Message', name: 'message', type: 'string', typeOptions: { rows: 4 }, default: '', required: true, displayOptions: { show: { operation: ['sendMessage'] } } },
			{ displayName: 'File URL', name: 'urlFile', type: 'string', default: '', required: true, displayOptions: { show: { operation: ['sendFileByUrl'] } } },
			{ displayName: 'File Name', name: 'fileName', type: 'string', default: '', required: true, placeholder: 'invoice.pdf', displayOptions: { show: { operation: ['sendFileByUrl'] } } },
			{ displayName: 'Caption', name: 'caption', type: 'string', default: '', displayOptions: { show: { operation: ['sendFileByUrl'] } } },
			{ displayName: 'Latitude', name: 'latitude', type: 'number', default: 0, displayOptions: { show: { operation: ['sendLocation'] } } },
			{ displayName: 'Longitude', name: 'longitude', type: 'number', default: 0, displayOptions: { show: { operation: ['sendLocation'] } } },
			{ displayName: 'Place Name', name: 'nameLocation', type: 'string', default: '', displayOptions: { show: { operation: ['sendLocation'] } } },
			{ displayName: 'Question', name: 'question', type: 'string', default: '', required: true, displayOptions: { show: { operation: ['sendPoll'] } } },
			{ displayName: 'Options (One per Line)', name: 'pollOptions', type: 'string', typeOptions: { rows: 4 }, default: '', required: true, displayOptions: { show: { operation: ['sendPoll'] } } },
			{ displayName: 'Allow Multiple Answers', name: 'multipleAnswers', type: 'boolean', default: false, displayOptions: { show: { operation: ['sendPoll'] } } },
			{ displayName: 'Count', name: 'count', type: 'number', default: 20, displayOptions: { show: { operation: ['getChatHistory'] } } },
			{ displayName: 'Minutes Back', name: 'minutes', type: 'number', default: 60, displayOptions: { show: { operation: ['lastIncomingMessages'] } } },
			{ displayName: 'Phone Number', name: 'phoneNumber', type: 'string', default: '', required: true, placeholder: '972501234567', displayOptions: { show: { operation: ['checkWhatsapp'] } } },
			{
				displayName: 'Options', name: 'options', type: 'collection', placeholder: 'Add option', default: {},
				displayOptions: { show: { operation: ['sendMessage'] } },
				options: [{ displayName: 'Reply to Message ID', name: 'quotedMessageId', type: 'string', default: '' }],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const out: INodeExecutionData[] = [];
		for (let i = 0; i < items.length; i++) {
			try {
				const op = this.getNodeParameter('operation', i) as string;
				const chat = () => toChatId(this.getNodeParameter('chatId', i) as string);
				let res: any;
				switch (op) {
					case 'sendMessage': {
						const o = this.getNodeParameter('options', i, {}) as IDataObject;
						res = await flowApiRequest.call(this, 'POST', 'sendMessage', { chatId: chat(), message: this.getNodeParameter('message', i), ...(o.quotedMessageId ? { quotedMessageId: o.quotedMessageId } : {}) });
						break;
					}
					case 'sendFileByUrl':
						res = await flowApiRequest.call(this, 'POST', 'sendFileByUrl', { chatId: chat(), urlFile: this.getNodeParameter('urlFile', i), fileName: this.getNodeParameter('fileName', i), caption: this.getNodeParameter('caption', i, '') });
						break;
					case 'sendLocation':
						res = await flowApiRequest.call(this, 'POST', 'sendLocation', { chatId: chat(), latitude: this.getNodeParameter('latitude', i), longitude: this.getNodeParameter('longitude', i), nameLocation: this.getNodeParameter('nameLocation', i, '') });
						break;
					case 'sendPoll': {
						const opts = String(this.getNodeParameter('pollOptions', i)).split('\n').map((s) => s.trim()).filter(Boolean);
						if (opts.length < 2) throw new NodeOperationError(this.getNode(), 'A poll needs at least 2 options', { itemIndex: i });
						res = await flowApiRequest.call(this, 'POST', 'sendPoll', { chatId: chat(), message: this.getNodeParameter('question', i), options: opts.map((optionName) => ({ optionName })), multipleAnswers: this.getNodeParameter('multipleAnswers', i, false) });
						break;
					}
					case 'getChatHistory':
						res = await flowApiRequest.call(this, 'POST', 'getChatHistory', { chatId: chat(), count: this.getNodeParameter('count', i, 20) });
						break;
					case 'lastIncomingMessages':
						res = await flowApiRequest.call(this, 'GET', 'lastIncomingMessages', undefined, { minutes: this.getNodeParameter('minutes', i, 60) });
						break;
					case 'readChat':
						res = await flowApiRequest.call(this, 'POST', 'readChat', { chatId: chat() });
						break;
					case 'checkWhatsapp':
						res = await flowApiRequest.call(this, 'POST', 'checkWhatsapp', { phoneNumber: Number(String(this.getNodeParameter('phoneNumber', i)).replace(/\D/g, '')) });
						break;
					case 'getContactInfo':
						res = await flowApiRequest.call(this, 'POST', 'getContactInfo', { chatId: chat() });
						break;
					case 'getStateInstance':
						res = await flowApiRequest.call(this, 'GET', 'getStateInstance');
						break;
				}
				const rows = Array.isArray(res) ? res : [res];
				for (const r of rows) out.push({ json: r as IDataObject, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) { out.push({ json: { error: (error as Error).message }, pairedItem: { item: i } }); continue; }
				throw error;
			}
		}
		return [out];
	}
}
