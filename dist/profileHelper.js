"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePost = exports.parseUserGrant = void 0;
const betro_js_lib_1 = require("betro-js-lib");
const bufferToImage_1 = require("./bufferToImage");
const parseUserGrant = async (encryptionKey, row) => {
    const response = {};
    if (row.own_private_key != null) {
        const privateKey = await betro_js_lib_1.symDecrypt(encryptionKey, row.own_private_key);
        if (privateKey != null) {
            response.own_private_key = privateKey.toString("base64");
            if (row.public_key != null && row.encrypted_profile_sym_key != null) {
                const derivedKey = await betro_js_lib_1.deriveExchangeSymKey(row.public_key, response.own_private_key);
                const sym_key_bytes = await betro_js_lib_1.symDecrypt(derivedKey, row.encrypted_profile_sym_key);
                if (sym_key_bytes == null) {
                    return response;
                }
                const sym_key = sym_key_bytes.toString("base64");
                const first_name_bytes = row.first_name != null
                    ? await betro_js_lib_1.symDecrypt(sym_key, row.first_name)
                    : null;
                const last_name_bytes = row.last_name != null
                    ? await betro_js_lib_1.symDecrypt(sym_key, row.last_name)
                    : null;
                const profile_picture_bytes = row.profile_picture != null
                    ? await betro_js_lib_1.symDecrypt(sym_key, row.profile_picture)
                    : null;
                response.first_name = first_name_bytes === null || first_name_bytes === void 0 ? void 0 : first_name_bytes.toString("utf-8");
                response.last_name = last_name_bytes === null || last_name_bytes === void 0 ? void 0 : last_name_bytes.toString("utf-8");
                if (profile_picture_bytes != null) {
                    response.profile_picture = bufferToImage_1.bufferToImageUrl(profile_picture_bytes);
                }
            }
        }
    }
    return response;
};
exports.parseUserGrant = parseUserGrant;
const parsePost = async (post, sym_key) => {
    let text_content = null;
    let media_content = null;
    if (post.text_content !== null) {
        const text = await betro_js_lib_1.symDecrypt(sym_key, post.text_content);
        if (text != null) {
            text_content = text.toString("utf-8");
        }
    }
    if (post.media_content !== null) {
        const media = await betro_js_lib_1.symDecrypt(sym_key, post.media_content);
        if (media != null) {
            media_content = bufferToImage_1.bufferToImageUrl(media);
        }
    }
    return {
        id: post.id,
        created_at: post.created_at,
        text_content: text_content,
        media_content: media_content,
        media_encoding: post.media_encoding,
        is_liked: post.is_liked,
        likes: post.likes,
    };
};
exports.parsePost = parsePost;
//# sourceMappingURL=profileHelper.js.map