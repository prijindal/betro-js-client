import { deriveExchangeSymKey, symDecrypt, symDecryptBuffer } from "@betro/lib";
import { bufferToImageUrl } from "./bufferToImage";
import { PostResponse } from "./types";
import { ProfileGrantRow } from "./UserResponses";

export interface UserProfile {
  first_name?: string | null;
  last_name?: string | null;
  profile_picture?: string | null;
  own_private_key?: string | null;
}

export const parseUserGrant = async (
  encryptionKey: string,
  row: ProfileGrantRow
): Promise<UserProfile> => {
  const response: UserProfile = {};
  if (row.own_private_key != null) {
    const privateKey = await symDecrypt(encryptionKey, row.own_private_key);
    if (privateKey != null) {
      response.own_private_key = privateKey.toString("base64");
      if (row.public_key != null && row.encrypted_profile_sym_key != null) {
        const derivedKey = await deriveExchangeSymKey(
          row.public_key,
          response.own_private_key
        );
        const sym_key_bytes = await symDecrypt(
          derivedKey,
          row.encrypted_profile_sym_key
        );
        if (sym_key_bytes == null) {
          return response;
        }
        const first_name_bytes =
          row.first_name != null
            ? await symDecryptBuffer(sym_key_bytes, row.first_name)
            : null;
        const last_name_bytes =
          row.last_name != null
            ? await symDecryptBuffer(sym_key_bytes, row.last_name)
            : null;
        const profile_picture_bytes =
          row.profile_picture != null
            ? await symDecryptBuffer(sym_key_bytes, row.profile_picture)
            : null;
        response.first_name = first_name_bytes?.toString("utf-8");
        response.last_name = last_name_bytes?.toString("utf-8");
        if (profile_picture_bytes != null) {
          response.profile_picture = bufferToImageUrl(profile_picture_bytes);
        }
      }
    }
  }
  return response;
};

export const parsePost = async (
  post: PostResponse,
  sym_key: Buffer
): Promise<{
  id: string;
  text_content: string | null;
  media_content: string | null;
  media_encoding: string | null;
  likes: number;
  is_liked: boolean;
  created_at: Date;
}> => {
  let text_content: string | null = null;
  let media_content: string | null = null;
  if (post.text_content !== null) {
    const text = await symDecryptBuffer(sym_key, post.text_content);
    if (text != null) {
      text_content = text.toString("utf-8");
    }
  }
  if (post.media_content !== null) {
    const media = await symDecryptBuffer(sym_key, post.media_content);
    if (media != null) {
      media_content = bufferToImageUrl(media);
    }
  }
  return {
    id: post.id,
    created_at: post.created_at,
    text_content: text_content,
    media_content: media_content,
    media_encoding: post.media_encoding,
    is_liked: post.is_liked,
    likes: post.likes,
  };
};
