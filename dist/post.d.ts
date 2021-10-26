import AuthController from "./auth";
import { PostResource, LikeResponse, PostResponse } from "./types";
declare class PostController {
    auth: AuthController;
    constructor(auth: AuthController);
    getPost: (id: string) => Promise<PostResource | null>;
    createPost: (group_id: string, encrypted_sym_key: string, text: string | null, media_encoding: string | null, media: Buffer | null) => Promise<PostResponse | null>;
    like: (id: string) => Promise<LikeResponse>;
    unlike: (id: string) => Promise<LikeResponse>;
}
export default PostController;
