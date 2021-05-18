import AuthController from "./auth";
import { UserSettingResponse, UserSettingsType } from "./types";

class SettingsController {
  auth: AuthController;
  constructor(auth: AuthController) {
    this.auth = auth;
  }
  fetchUserSettings = async (): Promise<Array<UserSettingResponse> | null> => {
    try {
      const response = await this.auth.instance.get(`/api/settings`);
      const data = response.data;
      return data;
    } catch (e) {
      return null;
    }
  };

  changeUserSettings = async (
    type: UserSettingsType,
    enabled: boolean
  ): Promise<null> => {
    try {
      const response = await this.auth.instance.post(`/api/settings`, {
        type,
        enabled,
      });
      const data = response.data;
      return data;
    } catch (e) {
      return null;
    }
  };
}

export default SettingsController;
