"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const betro_js_lib_1 = require("betro-js-lib");
const profileHelper_1 = require("./profileHelper");
class FollowController {
    constructor(auth) {
        this.fetchPendingApprovals = async (after) => {
            const limit = 50;
            try {
                const response = await this.auth.instance.get(`/api/follow/approvals?limit=${limit}&after=${after}`);
                const resp = response.data;
                const data = [];
                for (const res of resp.data) {
                    let userResponse = {};
                    userResponse = await profileHelper_1.parseUserGrant(this.auth.encryptionKey, res);
                    data.push({
                        id: res.id,
                        follower_id: res.follower_id,
                        public_key: res.public_key,
                        own_key_id: res.own_key_id,
                        created_at: res.created_at,
                        own_private_key: userResponse.own_private_key,
                        username: res.username,
                        ...userResponse,
                    });
                }
                return { ...resp, data };
            }
            catch (e) {
                console.error(e);
                return null;
            }
        };
        this.fetchFollowers = async (after) => {
            const limit = 50;
            try {
                const response = await this.auth.instance.get(`/api/follow/followers?limit=${limit}&after=${after}`);
                const resp = response.data;
                const data = [];
                for (const res of resp.data) {
                    const userResponse = await profileHelper_1.parseUserGrant(this.auth.encryptionKey, res);
                    data.push({
                        follow_id: res.follow_id,
                        group_id: res.group_id,
                        group_is_default: res.group_is_default,
                        group_name: res.group_name,
                        user_id: res.user_id,
                        username: res.username,
                        is_following: res.is_following,
                        is_following_approved: res.is_following_approved,
                        public_key: res.public_key,
                        ...userResponse,
                    });
                }
                return { ...resp, data };
            }
            catch (e) {
                return null;
            }
        };
        this.fetchFollowees = async (after) => {
            const limit = 50;
            try {
                const response = await this.auth.instance.get(`/api/follow/followees?limit=${limit}&after=${after}`);
                const resp = response.data;
                const data = [];
                for (const res of resp.data) {
                    let row = {
                        follow_id: res.follow_id,
                        is_approved: res.is_approved,
                        user_id: res.user_id,
                        username: res.username,
                    };
                    const userResponse = await profileHelper_1.parseUserGrant(this.auth.encryptionKey, res);
                    row = { ...row, ...userResponse };
                    data.push(row);
                }
                return { ...resp, data };
            }
            catch (e) {
                return null;
            }
        };
        this.followUser = async (followee_id, followee_key_id, followee_public_key) => {
            try {
                const ownKeyPair = this.auth.ecdhKeys[Object.keys(this.auth.ecdhKeys)[0]];
                const derivedKey = await betro_js_lib_1.deriveExchangeSymKey(followee_public_key, ownKeyPair.privateKey);
                const encrypted_profile_sym_key = await betro_js_lib_1.symEncrypt(derivedKey, Buffer.from(this.auth.symKey, "base64"));
                const response = await this.auth.instance.post("/api/follow/", {
                    followee_id: followee_id,
                    own_key_id: ownKeyPair.id,
                    followee_key_id: followee_key_id,
                    encrypted_profile_sym_key: encrypted_profile_sym_key,
                });
                const data = response.data;
                return data;
            }
            catch (e) {
                console.error(e);
                return null;
            }
        };
        this.approveUser = async (followId, follower_public_key, group_id, encrypted_by_user_group_sym_key, own_key_id, private_key) => {
            const decryptedGroupSymKey = await betro_js_lib_1.symDecrypt(this.auth.encryptionKey, encrypted_by_user_group_sym_key);
            const derivedKey = await betro_js_lib_1.deriveExchangeSymKey(follower_public_key, private_key);
            try {
                if (decryptedGroupSymKey != null) {
                    const encrypted_group_sym_key = await betro_js_lib_1.symEncrypt(derivedKey, decryptedGroupSymKey);
                    const encrypted_profile_sym_key = await betro_js_lib_1.symEncrypt(derivedKey, Buffer.from(this.auth.symKey, "base64"));
                    const response = await this.auth.instance.post("/api/follow/approve", {
                        follow_id: followId,
                        group_id: group_id,
                        encrypted_group_sym_key,
                        encrypted_profile_sym_key,
                        own_key_id: own_key_id,
                    });
                    const data = response.data;
                    return data;
                }
                return null;
            }
            catch (e) {
                return null;
            }
        };
        this.fetchUserEcdhKey = async (id) => {
            const response = await this.auth.instance.get(`/api/keys/ecdh/user/${id}`);
            return response.data;
        };
        this.fetchUserInfo = async (username) => {
            try {
                const response = await this.auth.instance.get(`/api/user/${username}`);
                const data = response.data;
                const userResponse = await profileHelper_1.parseUserGrant(this.auth.encryptionKey, data);
                return {
                    id: data.id,
                    username: data.username,
                    is_approved: data.is_approved,
                    is_following: data.is_following,
                    ...userResponse,
                    public_key: data.public_key,
                };
            }
            catch (e) {
                return null;
            }
        };
        this.searchUser = async (query) => {
            try {
                const response = await this.auth.instance.get(`/api/user/search?query=${query}`);
                const data = [];
                for (const res of response.data) {
                    let row = {
                        id: res.id,
                        username: res.username,
                        is_following: res.is_following,
                        is_following_approved: res.is_following_approved,
                    };
                    const userResponse = await profileHelper_1.parseUserGrant(this.auth.encryptionKey, res);
                    row = { ...row, ...userResponse, public_key: res.public_key };
                    data.push(row);
                }
                return data;
            }
            catch (e) {
                return [];
            }
        };
        this.auth = auth;
    }
}
exports.default = FollowController;
//# sourceMappingURL=follow.js.map