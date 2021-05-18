"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const betro_js_lib_1 = require("betro-js-lib");
class GroupController {
    constructor(auth) {
        this.fetchGroups = async () => {
            try {
                const response = await this.auth.instance.get(`/api/groups`);
                const data = response.data;
                return data;
            }
            catch (e) {
                return null;
            }
        };
        this.deleteGroup = async (groupId) => {
            try {
                const response = await this.auth.instance.delete(`/api/groups/${groupId}`);
                const data = response.data;
                return data;
            }
            catch (e) {
                return null;
            }
        };
        this.createGroup = async (name, is_default) => {
            const sym_key = await betro_js_lib_1.generateSymKey();
            const encryptedSymKey = await betro_js_lib_1.symEncrypt(this.auth.encryptionKey, Buffer.from(sym_key, "base64"));
            try {
                const response = await this.auth.instance.post(`/api/groups`, {
                    name: name,
                    sym_key: encryptedSymKey,
                    is_default: is_default,
                });
                return response.data;
            }
            catch (e) {
                return null;
            }
        };
        this.auth = auth;
    }
}
exports.default = GroupController;
//# sourceMappingURL=group.js.map