import AuthController from "./auth";
import AccountController from "./account";
import FollowController from "./follow";
import GroupController from "./group";
import FeedController from "./feed";
import NotificationController from "./notifications";
import SettingsController from "./settings";
import PostController from "./post";
import KeysController from "./keys";
import ConversationController from "./conversation";
export * from "./types";
export * from "./bufferToImage";
declare class BetroApi {
    private host;
    auth: AuthController;
    constructor(host: string);
    get account(): AccountController;
    get keys(): KeysController;
    get follow(): FollowController;
    get group(): GroupController;
    get feed(): FeedController;
    get notifications(): NotificationController;
    get settings(): SettingsController;
    get post(): PostController;
    get conversation(): ConversationController;
}
export default BetroApi;
