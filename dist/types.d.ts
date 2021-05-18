/// <reference types="node" />
import { PostUserResponse } from "./UserResponses";
export interface WhoAmiResponse {
    user_id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
}
export interface CountResponse {
    notifications: number;
    settings: number;
    groups: number;
    followers: number;
    followees: number;
    approvals: number;
    posts: number;
}
export interface UserProfileResponse {
    first_name: string;
    last_name: string;
    profile_picture: Buffer;
    sym_key: string;
}
export interface UserProfilePostRequest {
    sym_key: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
}
export interface UserProfilePutRequest {
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
}
export interface PostResource {
    id: string;
    text_content: string | null;
    media_content: string | null;
    media_encoding: string | null;
    likes: number;
    is_liked: boolean;
    user: PostResourceUser;
    created_at: Date;
}
export interface PostResourceUser {
    username: string;
    first_name?: string | null;
    last_name?: string | null;
    profile_picture?: string | null;
}
export interface PostsFeedResponse {
    posts: Array<PostResponse>;
    users: {
        [user_id: string]: PostUserResponse;
    };
    keys: {
        [key_id: string]: string;
    };
}
export interface PostResponse {
    id: string;
    user_id: string;
    media_content: string;
    media_encoding: string;
    text_content: string;
    key_id: string;
    likes: number;
    is_liked: boolean;
    created_at: Date;
}
export interface FeedPageInfo {
    updating: boolean;
    next: boolean;
    limit: number;
    total: number;
    after: string;
}
export interface ApprovalResponse {
    id: string;
    follower_id: string;
    username: string;
    created_at: Date;
    first_name?: string | null;
    last_name?: string | null;
    profile_picture?: string | null;
    public_key: string | null;
    own_key_id: string | null;
    own_private_key?: string | null;
}
export interface FollowerResponse {
    follow_id: string;
    group_id: string;
    group_is_default: boolean;
    group_name: string;
    user_id: string;
    username: string;
    is_following: boolean;
    is_following_approved: boolean;
    public_key: string | null;
    first_name?: string | null;
    last_name?: string | null;
    profile_picture?: string | null;
}
export interface FolloweeResponse {
    follow_id: string;
    is_approved: boolean;
    user_id: string;
    username: string;
    first_name?: string | null;
    last_name?: string | null;
    profile_picture?: string | null;
}
export interface UserInfo {
    id: string;
    is_following: boolean;
    is_approved: boolean;
    username: string;
    public_key?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    profile_picture?: Buffer | string | null;
}
export interface SearchResult {
    id: string;
    username: string;
    is_following: boolean;
    is_following_approved: boolean;
    public_key?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    profile_picture?: string | null;
}
export interface GroupResponse {
    id: string;
    sym_key: string;
    name: string;
    is_default: boolean;
}
export declare type UserSettingsType = "notification_on_approved" | "notification_on_followed" | "allow_search";
export declare type UserNotificationsActions = "notification_on_approved" | "notification_on_followed";
export interface NotificationResponse {
    id: string;
    user_id: string;
    action: UserSettingsType;
    content: string;
    read: boolean;
    payload: Record<string, unknown>;
    created_at: string;
}
export interface PaginatedResponse<T> {
    next: boolean;
    limit: number;
    total: number;
    after: string;
    data: Array<T>;
}
export interface UserSettingResponse {
    id: string;
    user_id: string;
    type: UserNotificationsActions;
    enabled: boolean;
}
export interface GetPostResponse {
    post: PostResponse & {
        key: string;
    };
    user: PostUserResponse;
}
export interface LikeResponse {
    liked: boolean;
    likes?: number;
}
