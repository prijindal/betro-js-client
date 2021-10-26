import AuthController from "./auth";
import { FeedPageInfo, PostResource, PostResponse, PostsFeedResponse } from "./types";
import { PostUserResponse } from "./UserResponses";
declare class FeedController {
    auth: AuthController;
    constructor(auth: AuthController);
    transformPostFeed: (feed: PostsFeedResponse, postToSymKey: (post: PostResponse, keys: {
        [key_id: string]: string;
    }, users: {
        [user_id: string]: PostUserResponse;
    }) => Promise<Buffer>) => Promise<Array<PostResource>>;
    private feedDefaultTransform;
    fetchUserPosts: (username: string, after: string | undefined) => Promise<{
        data: Array<PostResource>;
        pageInfo: FeedPageInfo;
    } | null>;
    fetchOwnPosts: (after: string | undefined) => Promise<{
        data: Array<PostResource>;
        pageInfo: FeedPageInfo;
    } | null>;
    fetchHomeFeed: (after: string | undefined) => Promise<{
        data: Array<PostResource>;
        pageInfo: FeedPageInfo;
    } | null>;
}
export default FeedController;
