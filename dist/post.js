"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const betro_js_lib_1 = require("betro-js-lib");
const profileHelper_1 = require("./profileHelper");
class PostController {
    constructor(auth) {
        this.getPost = async (id) => {
            const response = await this.auth.instance.get(`/api/post/${id}`);
            const resp = response.data;
            let user = {
                username: resp.user.username,
            };
            user = {
                username: resp.user.username,
                ...(await profileHelper_1.parseUserGrant(this.auth.encryptionKey, resp.user)),
            };
            if (resp.user.own_private_key == null || resp.user.public_key == null) {
                throw Error("Decryption issues");
            }
            const privateKey = await betro_js_lib_1.symDecrypt(this.auth.encryptionKey, resp.user.own_private_key);
            if (privateKey == null) {
                throw Error("Decryption issues");
            }
            const derivedKey = await betro_js_lib_1.deriveExchangeSymKey(resp.user.public_key, privateKey.toString("base64"));
            const symKey = await betro_js_lib_1.symDecrypt(derivedKey, resp.post.key);
            if (symKey == null) {
                throw Error("Decryption issues");
            }
            const sym_key = symKey.toString("base64");
            const parsedPost = await profileHelper_1.parsePost(resp.post, sym_key);
            return {
                ...parsedPost,
                user,
            };
        };
        this.createPost = async (group_id, encrypted_sym_key, text, media_encoding, media) => {
            try {
                const sym_key = await betro_js_lib_1.symDecrypt(this.auth.encryptionKey, encrypted_sym_key);
                let encryptedText = null;
                if (text != null && sym_key != null) {
                    encryptedText = await betro_js_lib_1.symEncrypt(sym_key.toString("base64"), Buffer.from(text));
                }
                let encryptedMedia = null;
                if (media != null && sym_key != null) {
                    encryptedMedia = await betro_js_lib_1.symEncrypt(sym_key.toString("base64"), media);
                }
                const response = await this.auth.instance.post("/api/post", {
                    group_id: group_id,
                    text_content: encryptedText,
                    media_content: encryptedMedia,
                });
                return response.data;
            }
            catch (e) {
                return null;
            }
        };
        this.like = async (id) => {
            const response = await this.auth.instance.post(`/api/post/${id}/like`, {});
            return response.data;
        };
        this.unlike = async (id) => {
            const response = await this.auth.instance.post(`/api/post/${id}/unlike`, {});
            return response.data;
        };
        this.auth = auth;
    }
}
exports.default = PostController;
//# sourceMappingURL=post.js.map