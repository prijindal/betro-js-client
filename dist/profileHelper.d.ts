import { PostResponse } from "./types";
import { ProfileGrantRow } from "./UserResponses";
export interface UserProfile {
    first_name?: string | null;
    last_name?: string | null;
    profile_picture?: string | null;
    own_private_key?: string | null;
}
export declare const parseUserGrant: (encryptionKey: string, row: ProfileGrantRow) => Promise<UserProfile>;
export declare const parsePost: (post: PostResponse, sym_key: string) => Promise<{
    id: string;
    text_content: string | null;
    media_content: string | null;
    media_encoding: string | null;
    likes: number;
    is_liked: boolean;
    created_at: Date;
}>;
