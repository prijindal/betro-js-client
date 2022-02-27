"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("@betro/lib");
const profileHelper_1 = require("./profileHelper");
class FeedController {
    constructor(auth) {
        this.transformPostFeed = async (feed, postToSymKey) => {
            const posts = [];
            const users = {};
            for (const user_id in feed.users) {
                if (Object.prototype.hasOwnProperty.call(feed.users, user_id)) {
                    const user = feed.users[user_id];
                    users[user_id] = {
                        username: user.username,
                        ...(await (0, profileHelper_1.parseUserGrant)(this.auth.encryptionKey, user)),
                    };
                }
            }
            for (const post of feed.posts) {
                const sym_key = await postToSymKey(post, feed.keys, feed.users);
                const parsedPost = await (0, profileHelper_1.parsePost)(post, sym_key);
                posts.push({
                    ...parsedPost,
                    user: users[post.user_id],
                });
            }
            return posts;
        };
        this.feedDefaultTransform = async (post, keys, users) => {
            const user = users[post.user_id];
            if (user.own_private_key == null || user.public_key == null) {
                throw Error("Decryption issues");
            }
            const privateKey = await (0, lib_1.symDecrypt)(this.auth.encryptionKey, user.own_private_key);
            if (privateKey == null) {
                throw Error("Decryption issues");
            }
            const derivedKey = await (0, lib_1.deriveExchangeSymKey)(user.public_key, privateKey.toString("base64"));
            const symKey = await (0, lib_1.symDecrypt)(derivedKey, keys[post.key_id]);
            if (symKey == null) {
                throw Error("Decryption issues");
            }
            return symKey;
        };
        this.fetchUserPosts = async (username, after) => {
            const limit = 5;
            if (after == null) {
                after = Buffer.from(new Date().toISOString(), "utf-8").toString("base64");
            }
            try {
                const response = await this.auth.instance.get(`/api/user/${username}/posts?limit=${limit}&after=${after}`);
                const posts = response.data;
                const data = await this.transformPostFeed(posts, this.feedDefaultTransform);
                return {
                    data,
                    pageInfo: response.data.pageInfo,
                };
            }
            catch (e) {
                console.error(e);
                return null;
            }
        };
        this.fetchOwnPosts = async (after) => {
            const limit = 29;
            if (after == null) {
                after = Buffer.from(new Date().toISOString(), "utf-8").toString("base64");
            }
            try {
                const response = await this.auth.instance.get(`/api/account/posts?limit=${limit}&after=${after}`);
                const posts = response.data;
                const data = await this.transformPostFeed(posts, async (post, keys) => {
                    const symKey = await (0, lib_1.symDecrypt)(this.auth.encryptionKey, keys[post.key_id]);
                    if (symKey != null) {
                        return symKey;
                    }
                    return null;
                });
                return {
                    data,
                    pageInfo: response.data.pageInfo,
                };
            }
            catch (e) {
                return null;
            }
        };
        this.fetchHomeFeed = async (after) => {
            const limit = 5;
            if (after == null) {
                after = Buffer.from(new Date().toISOString(), "utf-8").toString("base64");
            }
            try {
                const response = await this.auth.instance.get(`/api/feed?limit=${limit}&after=${after}`);
                const posts = response.data;
                const data = await this.transformPostFeed(posts, this.feedDefaultTransform);
                return {
                    data,
                    pageInfo: response.data.pageInfo,
                };
            }
            catch (e) {
                return null;
            }
        };
        this.auth = auth;
    }
}
exports.default = FeedController;
//# sourceMappingURL=feed.js.map