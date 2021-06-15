import { symDecrypt, deriveExchangeSymKey, symEncrypt } from "betro-js-lib";
import { parseUserGrant, UserProfile } from "./profileHelper";

import AuthController from "./auth";
import {
  ApprovalResponse,
  FolloweeResponse,
  FollowerResponse,
  SearchResult,
  UserInfo,
  PaginatedResponse,
} from "./types";
import {
  ApprovalResponseBackend,
  FolloweeResponseBackend,
  FollowerResponseBackend,
  SearchResultBackend,
  UserInfoResponseBackend,
} from "./UserResponses";

class FollowController {
  auth: AuthController;
  constructor(auth: AuthController) {
    this.auth = auth;
  }

  fetchPendingApprovals = async (
    after?: string
  ): Promise<PaginatedResponse<ApprovalResponse> | null> => {
    const limit = 50;
    try {
      const response = await this.auth.instance.get<
        PaginatedResponse<ApprovalResponseBackend>
      >(`/api/follow/approvals?limit=${limit}&after=${after}`);
      const resp = response.data;
      const data: Array<ApprovalResponse> = [];
      for (const res of resp.data) {
        let userResponse: UserProfile = {};
        userResponse = await parseUserGrant(this.auth.encryptionKey, res);
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
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  fetchFollowers = async (
    after?: string
  ): Promise<PaginatedResponse<FollowerResponse> | null> => {
    const limit = 50;
    try {
      const response = await this.auth.instance.get<
        PaginatedResponse<FollowerResponseBackend>
      >(`/api/follow/followers?limit=${limit}&after=${after}`);
      const resp = response.data;
      const data: Array<FollowerResponse> = [];
      for (const res of resp.data) {
        const userResponse = await parseUserGrant(this.auth.encryptionKey, res);
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
    } catch (e) {
      return null;
    }
  };

  fetchFollowees = async (
    after?: string
  ): Promise<PaginatedResponse<FolloweeResponse> | null> => {
    const limit = 50;
    try {
      const response = await this.auth.instance.get<
        PaginatedResponse<FolloweeResponseBackend>
      >(`/api/follow/followees?limit=${limit}&after=${after}`);
      const resp = response.data;
      const data: Array<FolloweeResponse> = [];
      for (const res of resp.data) {
        let row: FolloweeResponse = {
          follow_id: res.follow_id,
          is_approved: res.is_approved,
          user_id: res.user_id,
          username: res.username,
        };
        const userResponse = await parseUserGrant(this.auth.encryptionKey, res);
        row = { ...row, ...userResponse };
        data.push(row);
      }
      return { ...resp, data };
    } catch (e) {
      return null;
    }
  };

  followUser = async (
    followee_id: string,
    followee_key_id: string,
    followee_public_key?: string | null
  ): Promise<{
    is_following: boolean;
    is_approved: boolean;
    email: string;
  } | null> => {
    try {
      const ownKeyPair = this.auth.ecdhKeys[Object.keys(this.auth.ecdhKeys)[0]];
      let encrypted_profile_sym_key = null;
      if (followee_public_key != null) {
        const derivedKey = await deriveExchangeSymKey(
          followee_public_key,
          ownKeyPair.privateKey
        );
        encrypted_profile_sym_key = await symEncrypt(
          derivedKey,
          this.auth.symKey
        );
      }
      const response = await this.auth.instance.post("/api/follow/", {
        followee_id: followee_id,
        own_key_id: ownKeyPair.id,
        followee_key_id: followee_key_id,
        encrypted_profile_sym_key: encrypted_profile_sym_key,
      });
      const data = response.data;
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  approveUser = async (
    followId: string,
    follower_public_key: string,
    group_id: string,
    encrypted_by_user_group_sym_key: string,
    own_key_id: string,
    private_key: string,
    allowProfileRead: boolean = false
  ): Promise<{
    approved: boolean;
  } | null> => {
    const decryptedGroupSymKey = await symDecrypt(
      this.auth.encryptionKey,
      encrypted_by_user_group_sym_key
    );
    const derivedKey = await deriveExchangeSymKey(
      follower_public_key,
      private_key
    );
    try {
      if (decryptedGroupSymKey != null) {
        const encrypted_group_sym_key = await symEncrypt(
          derivedKey,
          decryptedGroupSymKey
        );
        let encrypted_profile_sym_key = null;
        if (allowProfileRead) {
          encrypted_profile_sym_key = await symEncrypt(
            derivedKey,
            this.auth.symKey
          );
        }
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
    } catch (e) {
      return null;
    }
  };

  fetchUserEcdhKey = async (
    id: string
  ): Promise<{ id: string; public_key: string }> => {
    const response = await this.auth.instance.get(`/api/keys/ecdh/user/${id}`);
    return response.data;
  };

  fetchUserInfo = async (username: string): Promise<UserInfo | null> => {
    try {
      const response = await this.auth.instance.get<UserInfoResponseBackend>(
        `/api/user/${username}`
      );
      const data = response.data;
      const userResponse = await parseUserGrant(this.auth.encryptionKey, data);
      return {
        id: data.id,
        username: data.username,
        is_approved: data.is_approved,
        is_following: data.is_following,
        ...userResponse,
        public_key: data.public_key,
      };
    } catch (e) {
      return null;
    }
  };

  searchUser = async (query: string): Promise<Array<SearchResult>> => {
    try {
      const response = await this.auth.instance.get<Array<SearchResultBackend>>(
        `/api/user/search?query=${query}`
      );
      const data: Array<SearchResult> = [];
      for (const res of response.data) {
        let row: SearchResult = {
          id: res.id,
          username: res.username,
          is_following: res.is_following,
          is_following_approved: res.is_following_approved,
        };
        const userResponse = await parseUserGrant(this.auth.encryptionKey, res);
        row = { ...row, ...userResponse, public_key: res.public_key };
        data.push(row);
      }
      return data;
    } catch (e) {
      return [];
    }
  };
}

export default FollowController;
