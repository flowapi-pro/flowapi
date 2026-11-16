export declare class FlowApiError extends Error { status: number; body: unknown; }
export declare function toChatId(v: string | number): string;
export interface FlowApiOptions { idInstance: string | number; apiTokenInstance: string; baseUrl?: string; retries?: number; fetch?: typeof fetch; }
export interface IncomingMessage { idMessage: string; timestamp: number; chatId: string; sender: string; senderName?: string; type: string; text: string | null; fileUrl: string | null; raw: any; }
export declare class FlowApi {
  constructor(opts: FlowApiOptions);
  url(method: string): string;
  call<T = any>(method: string, body?: Record<string, unknown>, opts?: { query?: Record<string, string | number | undefined> }): Promise<T>;
  getStateInstance(): Promise<{ stateInstance: "authorized" | "notAuthorized" | "blocked" | "starting" | string }>;
  getSettings(): Promise<Record<string, unknown>>;
  setSettings(settings: Record<string, unknown>): Promise<{ saveSettings: boolean }>;
  sendMessage(chat: string | number, message: string, extra?: Record<string, unknown>): Promise<{ idMessage: string }>;
  sendFileByUrl(chat: string | number, urlFile: string, fileName: string, caption?: string, extra?: Record<string, unknown>): Promise<{ idMessage: string }>;
  sendLocation(chat: string | number, latitude: number, longitude: number, extra?: Record<string, unknown>): Promise<{ idMessage: string }>;
  sendContact(chat: string | number, contact: Record<string, unknown>): Promise<{ idMessage: string }>;
  sendPoll(chat: string | number, message: string, options: (string | { optionName: string })[], multipleAnswers?: boolean): Promise<{ idMessage: string }>;
  sendTyping(chat: string | number): Promise<unknown>;
  receiveNotification(receiveTimeout?: number): Promise<{ receiptId: number; body: any } | null>;
  deleteNotification(receiptId: number): Promise<{ result: boolean }>;
  notifications(opts?: { receiveTimeout?: number; signal?: AbortSignal }): AsyncGenerator<any>;
  lastIncomingMessages(minutes?: number): Promise<any[]>;
  lastOutgoingMessages(minutes?: number): Promise<any[]>;
  getChatHistory(chat: string | number, count?: number): Promise<any[]>;
  readChat(chat: string | number): Promise<unknown>;
  checkWhatsapp(phoneNumber: string | number): Promise<{ existsWhatsapp: boolean }>;
  getContactInfo(chat: string | number): Promise<any>;
  getContacts(): Promise<any[]>;
  createGroup(groupName: string, members: (string | number)[]): Promise<any>;
  getGroupData(groupId: string): Promise<any>;
  addGroupParticipant(groupId: string, participant: string | number): Promise<any>;
  mcpUrl(): string;
}
export declare function parseIncomingMessage(body: any): IncomingMessage | null;
export default FlowApi;
