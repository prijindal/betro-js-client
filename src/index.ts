import AuthController from "./auth";
import AccountController from "./account";
import FollowController from "./follow";
import GroupController from "./group";
import FeedController from "./feed";
import NotificationController from "./notifications";
import SettingsController from "./settings";
import PostController from "./post";
import KeysController from "./keys";
export * from "./types";
export * from "./bufferToImage";

class BetroApi {
  private host: string;
  public auth: AuthController;
  constructor(host: string) {
    this.host = host;
    this.auth = new AuthController(this.host);
  }

  get account() {
    return new AccountController(this.auth);
  }

  get keys() {
    return new KeysController(this.auth);
  }

  get follow() {
    return new FollowController(this.auth);
  }

  get group() {
    return new GroupController(this.auth);
  }

  get feed() {
    return new FeedController(this.auth);
  }

  get notifications() {
    return new NotificationController(this.auth);
  }

  get settings() {
    return new SettingsController(this.auth);
  }

  get post() {
    return new PostController(this.auth);
  }
}

export default BetroApi;
