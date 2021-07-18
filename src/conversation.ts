import { AxiosResponse } from "axios";
import { deriveExchangeSymKey, symDecrypt, symEncrypt } from "betro-js-lib";
import { PaginatedResponse, MessageResponse } from "./types";
import { ConversationResponseBackend } from "./UserResponses";
import AuthController from "./auth";
import { parseUserGrant } from "./profileHelper";

class ConversationController {
  auth: AuthController;
  constructor(auth: AuthController) {
    this.auth = auth;
  }
  ws: WebSocket | null;

  fetchConversations = async (
    after: string | undefined
  ): Promise<PaginatedResponse<ConversationResponseBackend>> => {
    const limit = 5;
    if (after == null) {
      after = Buffer.from(new Date().toISOString(), "utf-8").toString("base64");
    }
    try {
      const response = await this.auth.instance.get<
        PaginatedResponse<ConversationResponseBackend>
      >(`/api/messages/?limit=${limit}&after=${after}`);
      const data: Array<ConversationResponseBackend> = [];
      for (const row of response.data.data) {
        data.push({
          ...row,
          ...(await parseUserGrant(this.auth.encryptionKey, row)),
        });
      }
      return {
        next: response.data.next,
        limit: response.data.limit,
        total: response.data.total,
        after: response.data.after,
        data: data,
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  fetchConversation = async (
    id: string
  ): Promise<ConversationResponseBackend> => {
    try {
      const response =
        await this.auth.instance.get<ConversationResponseBackend>(
          `/api/messages/${id}`
        );
      let data = response.data;
      data = {
        ...response.data,
        ...(await parseUserGrant(this.auth.encryptionKey, response.data)),
      };
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  createConversation = async (
    user_id: string,
    user_key_id: string
  ): Promise<ConversationResponseBackend> => {
    try {
      const ownKeyPair = this.auth.ecdhKeys[Object.keys(this.auth.ecdhKeys)[0]];
      const response = await this.auth.instance.post<
        any,
        AxiosResponse<ConversationResponseBackend>
      >("/api/messages", {
        receiver_id: user_id,
        sender_key_id: ownKeyPair.id,
        receiver_key_id: user_key_id,
      });
      const data = response.data;
      const userResponse = await parseUserGrant(this.auth.encryptionKey, data);
      return { ...data, ...userResponse };
    } catch (e) {
      console.error(e.response.data);
    }
  };

  sendMessage = async (
    conversation_id: string,
    private_key: string,
    public_key: string,
    text_content: string
  ): Promise<MessageResponse> => {
    const derivedKey = await deriveExchangeSymKey(public_key, private_key);
    const encryptedMessage = await symEncrypt(
      derivedKey,
      Buffer.from(text_content, "utf-8")
    );
    const response = await this.auth.instance.post(
      `/api/messages/${conversation_id}/messages`,
      {
        message: encryptedMessage,
      }
    );
    return response.data;
  };

  fetchMessages = async (
    conversation_id: string,
    private_key: string,
    public_key: string,
    after?: string | undefined
  ): Promise<PaginatedResponse<MessageResponse>> => {
    const limit = 20;
    if (after == null) {
      after = Buffer.from(new Date().toISOString(), "utf-8").toString("base64");
    }
    const derivedKey = await deriveExchangeSymKey(public_key, private_key);
    const response = await this.auth.instance.get<
      PaginatedResponse<MessageResponse>
    >(
      `/api/messages/${conversation_id}/messages?limit=${limit}&after=${after}`
    );
    const data: Array<MessageResponse> = [];
    for (const row of response.data.data) {
      const message = await symDecrypt(derivedKey, row.message);
      data.push({
        ...row,
        message: message.toString("utf-8"),
      });
    }
    return {
      next: response.data.next,
      limit: response.data.limit,
      total: response.data.total,
      after: response.data.after,
      data: data,
    };
  };

  parseMessage = async (
    conversation: ConversationResponseBackend,
    message: string
  ): Promise<string | null> => {
    if (
      conversation != null &&
      conversation.public_key != null &&
      conversation.own_private_key != null
    ) {
      const derivedKey = await deriveExchangeSymKey(
        conversation.public_key,
        conversation.own_private_key
      );
      const decryptedMessage = await symDecrypt(derivedKey, message);
      return decryptedMessage.toString("utf-8");
    }
    return null;
  };

  listenMessages = (messageEventListener: (m: MessageEvent) => void): void => {
    if (this.ws == null) {
      const hostArr = this.auth.getHost().split("://");
      const host = hostArr[1];
      const protocol = hostArr[0] == "http" ? "ws" : "wss";
      const s = new WebSocket(`${protocol}://${host}/messages`);
      this.ws = s;
      this.ws.addEventListener("error", (m) => {
        console.log("error");
      });
      this.ws.addEventListener("close", () => {
        console.log("websocket connection closed");
        this.ws = null;
      });
      this.ws.addEventListener("open", (m) => {
        const payload = { action: "login", token: this.auth.getToken() };
        if (this.ws != null) {
          this.ws.send(JSON.stringify(payload));
        }
        console.log("websocket connection open");
      });
      this.ws.addEventListener("message", messageEventListener);
    }
  };
}

export default ConversationController;
