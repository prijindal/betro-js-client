import { includes } from "lodash";
import faker from "faker";
import BetroApi, { GroupResponse } from "../src";
import { getMasterKey, getMasterHash, getEncryptionKey } from "betro-js-lib";

export interface GeneratedUser {
  credentials: {
    username: string;
    email: string;
    master_hash: string;
  };
  profile: {
    first_name: string;
    last_name: string;
    profile_picture: Buffer;
  };
  password: string;
  encryption_key: string;
  keys: {
    // publicKey?: string;
    // privateKey?: string;
    groupSymKey?: string;
    profileSymKey?: string;
    ecdhKeys?: Array<{ id: string; public_key: string; private_key: string }>;
  };
  groups?: Array<GroupResponse>;
  id?: string;
  api: BetroApi;
}

export const generateUsers = async (
  port: string,
  n: number = 2
): Promise<Array<GeneratedUser>> => {
  const users: Array<GeneratedUser> = [];
  for (let index = 0; index < n; index++) {
    let email = faker.internet.email();
    while (
      includes(
        users.map((a) => a.credentials.email),
        email
      )
    ) {
      email = faker.internet.email();
    }
    let username = faker.internet.userName();
    while (
      includes(
        users.map((a) => a.credentials.username),
        username
      )
    ) {
      username = faker.internet.userName();
    }
    const password = faker.internet.password();
    const masterKey = await getMasterKey(email, password);
    const master_hash = await getMasterHash(masterKey, password);
    const encryption_key = await getEncryptionKey(masterKey);
    users.push({
      credentials: {
        username: username,
        email: email,
        master_hash: master_hash,
      },
      profile: {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        profile_picture: Buffer.from("wxwx"),
      },
      password,
      encryption_key,
      keys: {},
      api: new BetroApi(`http://localhost:${port}`),
    });
  }
  return users;
};
