import AuthController from "./auth";
import { ApprovalResponse, FolloweeResponse, FollowerResponse, SearchResult, UserInfo, PaginatedResponse } from "./types";
declare class FollowController {
    auth: AuthController;
    constructor(auth: AuthController);
    fetchPendingApprovals: (after?: string) => Promise<PaginatedResponse<ApprovalResponse> | null>;
    fetchFollowers: (after?: string) => Promise<PaginatedResponse<FollowerResponse> | null>;
    fetchFollowees: (after?: string) => Promise<PaginatedResponse<FolloweeResponse> | null>;
    followUser: (followee_id: string, followee_key_id: string, followee_public_key: string) => Promise<{
        is_following: boolean;
        is_approved: boolean;
        email: string;
    } | null>;
    approveUser: (followId: string, follower_public_key: string, group_id: string, encrypted_by_user_group_sym_key: string, own_key_id: string, private_key: string) => Promise<{
        approved: boolean;
    } | null>;
    fetchUserEcdhKey: (id: string) => Promise<{
        id: string;
        public_key: string;
    }>;
    fetchUserInfo: (username: string) => Promise<UserInfo | null>;
    searchUser: (query: string) => Promise<Array<SearchResult>>;
}
export default FollowController;
