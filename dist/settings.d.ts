import AuthController from "./auth";
import { UserSettingResponse, UserSettingsType } from "./types";
declare class SettingsController {
    auth: AuthController;
    constructor(auth: AuthController);
    fetchUserSettings: () => Promise<Array<UserSettingResponse> | null>;
    changeUserSettings: (type: UserSettingsType, enabled: boolean) => Promise<UserSettingResponse | null>;
}
export default SettingsController;
