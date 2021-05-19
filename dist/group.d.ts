import AuthController from "./auth";
import { GroupResponse } from "./types";
declare class GroupController {
    auth: AuthController;
    constructor(auth: AuthController);
    fetchGroups: () => Promise<Array<GroupResponse> | null>;
    deleteGroup: (groupId: string) => Promise<{
        deleted: boolean;
    } | null>;
    createGroup: (name: string, is_default: boolean) => Promise<GroupResponse | null>;
}
export default GroupController;
