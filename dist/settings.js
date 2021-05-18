"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SettingsController {
    constructor(auth) {
        this.fetchUserSettings = async () => {
            try {
                const response = await this.auth.instance.get(`/api/settings`);
                const data = response.data;
                return data;
            }
            catch (e) {
                return null;
            }
        };
        this.changeUserSettings = async (type, enabled) => {
            try {
                const response = await this.auth.instance.post(`/api/settings`, {
                    type,
                    enabled,
                });
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
exports.default = SettingsController;
//# sourceMappingURL=settings.js.map