import AuthController from "./auth";
import { NotificationResponse } from "./types";
declare class NotificationController {
    auth: AuthController;
    constructor(auth: AuthController);
    fetchNotifications: () => Promise<Array<NotificationResponse> | null>;
    readNotification: (notification_id: string) => Promise<boolean>;
}
export default NotificationController;
