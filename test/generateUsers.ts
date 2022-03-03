import { includes } from "lodash";
import casual from "casual";
import BetroApi, { GroupResponse } from "../src";

export interface GeneratedUser {
  credentials: {
    username: string;
    email: string;
  };
  profile: {
    first_name: string;
    last_name: string;
    profile_picture: Buffer;
  };
  password: string;
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
    let email = casual.email;
    while (
      includes(
        users.map((a) => a.credentials.email),
        email
      )
    ) {
      email = casual.email;
    }
    let username = casual.username;
    while (
      includes(
        users.map((a) => a.credentials.username),
        username
      )
    ) {
      username = casual.username;
    }
    const password = casual.password;
    users.push({
      credentials: {
        username: username,
        email: email,
      },
      profile: {
        first_name: casual.first_name,
        last_name: casual.last_name,
        profile_picture: Buffer.from("wxwx"),
      },
      password,
      api: new BetroApi(`http://localhost:${port}`),
    });
  }
  return users;
};
