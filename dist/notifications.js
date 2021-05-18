"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NotificationController {
    constructor(auth) {
        this.fetchNotifications = async () => {
            try {
                const response = await this.auth.instance.get(`/api/notifications`);
                const data = response.data;
                return data;
            }
            catch (e) {
                return null;
            }
        };
        this.readNotification = async (notification_id) => {
            try {
                const response = await this.auth.instance.post(`/api/notifications/read`, {
                    notification_id,
                });
                return response.data.read;
            }
            catch (e) {
                return false;
            }
        };
        this.auth = auth;
    }
}
exports.default = NotificationController;
//# sourceMappingURL=notifications.js.map