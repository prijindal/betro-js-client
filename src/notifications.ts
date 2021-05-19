import AuthController from "./auth";
import { NotificationResponse } from "./types";

class NotificationController {
  auth: AuthController;
  constructor(auth: AuthController) {
    this.auth = auth;
  }

  fetchNotifications =
    async (): Promise<Array<NotificationResponse> | null> => {
      try {
        const response = await this.auth.instance.get("/api/notifications");
        const data = response.data;
        return data;
      } catch (e) {
        return null;
      }
    };

  readNotification = async (notification_id: string): Promise<boolean> => {
    try {
      const response = await this.auth.instance.post(
        "/api/notifications/read",
        {
          notification_id,
        }
      );
      return response.data.read;
    } catch (e) {
      return false;
    }
  };
}

export default NotificationController;
