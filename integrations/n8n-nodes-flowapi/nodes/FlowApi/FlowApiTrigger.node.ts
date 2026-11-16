import type { IDataObject, IHookFunctions, INodeType, INodeTypeDescription, IWebhookFunctions, IWebhookResponseData } from 'n8n-workflow';
import { flowApiRequest } from './GenericFunctions';

/** Starts a workflow on WhatsApp events. On activation it points the instance webhook at this workflow. */
export class FlowApiTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Flow API Trigger (WhatsApp)',
		name: 'flowApiTrigger',
		icon: 'file:flowapi.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when a WhatsApp event arrives',
		defaults: { name: 'Flow API Trigger' },
		inputs: [],
		outputs: ['main'],
		credentials: [{ name: 'flowApi', required: true }],
		webhooks: [{ name: 'default', httpMethod: 'POST', responseMode: 'onReceived', path: 'flowapi' }],
		properties: [
			{
				displayName: 'Events', name: 'events', type: 'multiOptions', default: ['incomingMessageReceived'],
				options: [
					{ name: 'Incoming Message', value: 'incomingMessageReceived' },
					{ name: 'Message Sent From Phone', value: 'outgoingMessageReceived' },
					{ name: 'Message Sent via API', value: 'outgoingAPIMessageReceived' },
					{ name: 'Delivery / Read Status', value: 'outgoingMessageStatus' },
					{ name: 'Connection State Changed', value: 'stateInstanceChanged' },
					{ name: 'Incoming Call', value: 'incomingCall' },
				],
			},
			{ displayName: 'Ignore Group Messages', name: 'ignoreGroups', type: 'boolean', default: true },
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const s = await flowApiRequest.call(this, 'GET', 'getSettings');
				return s?.webhookUrl === this.getNodeWebhookUrl('default');
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const events = this.getNodeParameter('events') as string[];
				const on = (e: string) => (events.includes(e) ? 'yes' : 'no');
				await flowApiRequest.call(this, 'POST', 'setSettings', {
					webhookUrl: this.getNodeWebhookUrl('default'),
					incomingWebhook: on('incomingMessageReceived'), outgoingMessageWebhook: on('outgoingMessageReceived'),
					outgoingAPIMessageWebhook: on('outgoingAPIMessageReceived'), outgoingWebhook: on('outgoingMessageStatus'),
					stateWebhook: on('stateInstanceChanged'), incomingCallWebhook: on('incomingCall'),
				});
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				await flowApiRequest.call(this, 'POST', 'setSettings', { webhookUrl: '' });
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;
		const events = this.getNodeParameter('events') as string[];
		const ignoreGroups = this.getNodeParameter('ignoreGroups') as boolean;
		const chatId = String((body.senderData as IDataObject)?.chatId || '');
		if (!events.includes(String(body.typeWebhook)) || (ignoreGroups && chatId.endsWith('@g.us'))) return { noWebhookResponse: false, workflowData: undefined };
		const md = (body.messageData || {}) as IDataObject;
		const text = (md.textMessageData as IDataObject)?.textMessage ?? (md.extendedTextMessageData as IDataObject)?.text ?? (md.fileMessageData as IDataObject)?.caption ?? '';
		return { workflowData: [this.helpers.returnJsonArray([{ ...body, chatId, text }])] };
	}
}
