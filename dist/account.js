"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const betro_js_lib_1 = require("betro-js-lib");
class AccountController {
    constructor(auth) {
        this.fetchProfilePicture = async () => {
            if (!this.auth.isAuthenticated())
                return null;
            try {
                const response = await this.auth.instance.get("/api/account/profile_picture");
                const data = response.data;
                const profile_picture = await betro_js_lib_1.symDecrypt(this.auth.symKey, data);
                return profile_picture;
            }
            catch (e) {
                return null;
            }
        };
        this.whoAmi = async () => {
            if (!this.auth.isAuthenticated())
                return null;
            const response = await this.auth.instance.get("/api/account/whoami");
            const data = response.data;
            let first_name;
            let last_name;
            if (data.first_name != null) {
                const first_name_bytes = await betro_js_lib_1.symDecrypt(this.auth.symKey, data.first_name);
                first_name = first_name_bytes?.toString("utf-8");
            }
            if (data.last_name != null) {
                const last_name_bytes = await betro_js_lib_1.symDecrypt(this.auth.symKey, data.last_name);
                last_name = last_name_bytes?.toString("utf-8");
            }
            return {
                user_id: data.user_id,
                username: data.username,
                email: data.email,
                first_name: first_name,
                last_name: last_name,
            };
        };
        this.fetchCounts = async () => {
            try {
                const include_fields = [
                    "notifications",
                    "settings",
                    "groups",
                    "followers",
                    "followees",
                    "approvals",
                    "posts",
                ];
                const response = await this.auth.instance.get(`/api/account/count?include_fields=${include_fields.join(",")}`);
                const data = response.data;
                return data;
            }
            catch (e) {
                return null;
            }
        };
        this.fetchProfile = async () => {
            try {
                const response = await this.auth.instance.get("/api/account/profile");
                const data = response.data;
                const encrypted_first_name = data.first_name;
                const encrypted_last_name = data.last_name;
                const encrypted_profile_picture = data.profile_picture;
                const encrypted_sym_key = data.sym_key;
                const symDecrypted = await betro_js_lib_1.symDecrypt(this.auth.encryptionKey, encrypted_sym_key);
                if (symDecrypted != null) {
                    const sym_key = symDecrypted.toString("base64");
                    const first_name = await betro_js_lib_1.symDecrypt(sym_key, encrypted_first_name);
                    const last_name = await betro_js_lib_1.symDecrypt(sym_key, encrypted_last_name);
                    const profile_picture = await betro_js_lib_1.symDecrypt(sym_key, encrypted_profile_picture);
                    if (first_name == null ||
                        last_name == null ||
                        profile_picture == null) {
                        throw new Error("Failed decryption");
                    }
                    return {
                        first_name: first_name.toString("utf-8"),
                        last_name: last_name.toString("utf-8"),
                        profile_picture: profile_picture,
                        sym_key: sym_key,
                    };
                }
                return null;
            }
            catch (e) {
                return null;
            }
        };
        this.createProfile = async (first_name, last_name, profile_picture) => {
            try {
                const encrypted_sym_key = await betro_js_lib_1.symEncrypt(this.auth.encryptionKey, Buffer.from(this.auth.symKey, "base64"));
                const encrypted_first_name = await betro_js_lib_1.symEncrypt(this.auth.symKey, Buffer.from(first_name));
                const encrypted_last_name = await betro_js_lib_1.symEncrypt(this.auth.symKey, Buffer.from(last_name));
                const request = {
                    sym_key: encrypted_sym_key,
                    first_name: encrypted_first_name,
                    last_name: encrypted_last_name,
                };
                if (profile_picture != null) {
                    const encrypted_profile_picture = await betro_js_lib_1.symEncrypt(this.auth.symKey, profile_picture);
                    request.profile_picture = encrypted_profile_picture;
                }
                const response = await this.auth.instance.post(`/api/account/profile`, request);
                const data = response.data;
                return data;
            }
            catch (e) {
                return null;
            }
        };
        this.updateProfile = async (first_name, last_name, profile_picture) => {
            try {
                const request = {};
                if (first_name != null) {
                    request.first_name = await betro_js_lib_1.symEncrypt(this.auth.symKey, Buffer.from(first_name));
                }
                if (last_name != null) {
                    request.last_name = await betro_js_lib_1.symEncrypt(this.auth.symKey, Buffer.from(last_name));
                }
                if (profile_picture != null) {
                    request.profile_picture = await betro_js_lib_1.symEncrypt(this.auth.symKey, profile_picture);
                }
                const response = await this.auth.instance.put("/api/account/profile", request);
                const data = response.data;
                return data;
            }
            catch (e) {
                return null;
            }
        };
        this.auth = auth;
    }
}
exports.default = AccountController;
//# sourceMappingURL=account.js.map