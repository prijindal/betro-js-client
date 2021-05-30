"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const betro_js_lib_1 = require("betro-js-lib");
const profileHelper_1 = require("./profileHelper");
class ConversationController {
    constructor(auth) {
        this.fetchConversations = async (after) => {
            const limit = 5;
            if (after == null) {
                after = Buffer.from(new Date().toISOString(), "utf-8").toString("base64");
            }
            try {
                const response = await this.auth.instance.get(`/api/messages/?limit=${limit}&after=${after}`);
                const data = [];
                for (const row of response.data.data) {
                    data.push({
                        ...row,
                        ...(await profileHelper_1.parseUserGrant(this.auth.encryptionKey, row)),
                    });
                }
                return {
                    next: response.data.next,
                    limit: response.data.limit,
                    total: response.data.total,
                    after: response.data.after,
                    data: data,
                };
            }
            catch (e) {
                console.error(e);
                return null;
            }
        };
        this.fetchConversation = async (id) => {
            try {
                const response = await this.auth.instance.get(`/api/messages/${id}`);
                let data = response.data;
                data = {
                    ...response.data,
                    ...(await profileHelper_1.parseUserGrant(this.auth.encryptionKey, response.data)),
                };
                return data;
            }
            catch (e) {
                console.error(e);
                return null;
            }
        };
        this.createConversation = async (user_id, user_key_id) => {
            try {
                const ownKeyPair = this.auth.ecdhKeys[Object.keys(this.auth.ecdhKeys)[0]];
                const response = await this.auth.instance.post("/api/messages", {
                    receiver_id: user_id,
                    sender_key_id: ownKeyPair.id,
                    receiver_key_id: user_key_id,
                });
                const data = response.data;
                const userResponse = await profileHelper_1.parseUserGrant(this.auth.encryptionKey, data);
                return { ...data, ...userResponse };
            }
            catch (e) {
                console.error(e);
            }
        };
        this.sendMessage = async (conversation_id, private_key, public_key, text_content) => {
            const derivedKey = await betro_js_lib_1.deriveExchangeSymKey(public_key, private_key);
            const encryptedMessage = await betro_js_lib_1.symEncrypt(derivedKey, Buffer.from(text_content, "utf-8"));
            const response = await this.auth.instance.post(`/api/messages/${conversation_id}/messages`, {
                message: encryptedMessage,
            });
            return response.data;
        };
        this.fetchMessages = async (conversation_id, private_key, public_key, after) => {
            const limit = 20;
            if (after == null) {
                after = Buffer.from(new Date().toISOString(), "utf-8").toString("base64");
            }
            const derivedKey = await betro_js_lib_1.deriveExchangeSymKey(public_key, private_key);
            const response = await this.auth.instance.get(`/api/messages/${conversation_id}/messages?limit=${limit}&after=${after}`);
            const data = [];
            for (const row of response.data.data) {
                const message = await betro_js_lib_1.symDecrypt(derivedKey, row.message);
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
        this.auth = auth;
    }
}
exports.default = ConversationController;
//# sourceMappingURL=conversation.js.map