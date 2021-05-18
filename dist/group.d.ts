import AuthController from "./auth";
import { GroupResponse } from "./types";
declare class GroupController {
    auth: AuthController;
    constructor(auth: AuthController);
    fetchGroups: () => Promise<Array<GroupResponse> | null>;
    deleteGroup: (groupId: string) => Promise<{
        is_following: boolean;
        is_approved: boolean;
        email: string;
    } | null>;
    createGroup: (name: string, is_default: boolean) => Promise<GroupResponse | null>;
}
export default GroupController;
