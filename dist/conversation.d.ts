import { PaginatedResponse, MessageResponse } from "./types";
import { ConversationResponseBackend } from "./UserResponses";
import AuthController from "./auth";
declare class ConversationController {
    auth: AuthController;
    constructor(auth: AuthController);
    ws: WebSocket | null;
    fetchConversations: (after: string | undefined) => Promise<PaginatedResponse<ConversationResponseBackend>>;
    fetchConversation: (id: string) => Promise<ConversationResponseBackend>;
    createConversation: (user_id: string, user_key_id: string) => Promise<ConversationResponseBackend>;
    sendMessage: (conversation_id: string, private_key: string, public_key: string, text_content: string) => Promise<MessageResponse>;
    fetchMessages: (conversation_id: string, private_key: string, public_key: string, after?: string | undefined) => Promise<PaginatedResponse<MessageResponse>>;
    parseMessage: (conversation: ConversationResponseBackend, message: string) => Promise<string | null>;
    listenMessages: (messageEventListener: (m: MessageEvent) => void) => void;
}
export default ConversationController;
