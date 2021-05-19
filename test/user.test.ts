import "betro-js-lib/dist/setupNodePollyfill";
import { includes } from "lodash";
import faker from "faker";
import BetroApi, { GroupResponse, UserSettingsType } from "../src";
import {
  getMasterKey,
  getMasterHash,
  getEncryptionKey,
  symEncrypt,
  symDecrypt,
} from "betro-js-lib";

interface GeneratedUser {
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

const generateUsers = async (
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

describe("User functions", () => {
  let users: Array<GeneratedUser> = [];
  const tokenMap: { [email: string]: string } = {};
  const port = process.env.PORT || "4000";
  beforeAll(async () => {
    users = await generateUsers(port);
  });
  it("Check email availability", async () => {
    for await (const user of users) {
      const isAvailable = await user.api.auth.isAvailableEmail(
        user.credentials.email
      );
      expect(isAvailable).toEqual(true);
    }
  });
  it("Check username availability", async () => {
    for await (const user of users) {
      const isAvailable = await user.api.auth.isAvailableUsername(
        user.credentials.email
      );
      expect(isAvailable).toEqual(true);
    }
  });
  it("Create users", async () => {
    for await (const user of users) {
      const isRegistered = await user.api.auth.register(
        user.credentials.username,
        user.credentials.email,
        user.password
      );
      expect(isRegistered).toEqual(true);
    }
  });
  it("Login users", async () => {
    for await (const user of users) {
      const isLoggedIn = await user.api.auth.login(
        user.credentials.email,
        user.password,
        false
      );
      expect(isLoggedIn).toEqual(true);
      // TODO: Delete this because of handling inside api
      tokenMap[user.credentials.email] = user.api.auth.getToken();
    }
  });
  it("Fetches keys", async () => {
    for (const email in tokenMap) {
      if (Object.prototype.hasOwnProperty.call(tokenMap, email)) {
        const userIndex = users.findIndex((a) => a.credentials.email == email);
        const isTokens = await users[userIndex].api.keys.fetchKeys();
        expect(isTokens).toEqual(true);
      }
    }
  });
  it("Saves profile information", async () => {
    for (const email in tokenMap) {
      if (Object.prototype.hasOwnProperty.call(tokenMap, email)) {
        const userIndex = users.findIndex((a) => a.credentials.email == email);
        const user = users[userIndex];
        const profile = await user.api.account.createProfile(
          user.profile.first_name,
          user.profile.last_name,
          user.profile.profile_picture
        );
        expect(profile.first_name).not.toBeNull();
        expect(profile.last_name).not.toBeNull();
        expect(profile.profile_picture).not.toBeNull();
      }
    }
  });
  it("Checks profile information", async () => {
    for (const email in tokenMap) {
      if (Object.prototype.hasOwnProperty.call(tokenMap, email)) {
        const userIndex = users.findIndex((a) => a.credentials.email == email);
        const user = users[userIndex];
        const profile = await user.api.account.fetchProfile();
        expect(profile.first_name).toEqual(user.profile.first_name);
        expect(profile.last_name).toEqual(user.profile.last_name);
        expect(profile.profile_picture).toEqual(user.profile.profile_picture);
        expect(profile.sym_key).toEqual(user.api.auth.symKey);
      }
    }
  });
  it("Updates Profile information", async () => {
    for (const email in tokenMap) {
      if (Object.prototype.hasOwnProperty.call(tokenMap, email)) {
        const userIndex = users.findIndex((a) => a.credentials.email == email);
        const user = users[userIndex];
        const profile = await user.api.account.updateProfile(
          user.profile.first_name,
          user.profile.last_name,
          Buffer.from("jc3o9chn32oc3")
        );
        expect(profile.first_name).toBeTruthy();
        expect(profile.last_name).toBeTruthy();
        expect(profile.profile_picture).toBeTruthy();
        expect(profile.sym_key).toBeTruthy();
      }
    }
  });
  it("Check whoami", async () => {
    for (const email in tokenMap) {
      if (Object.prototype.hasOwnProperty.call(tokenMap, email)) {
        const userIndex = users.findIndex((a) => a.credentials.email == email);
        const user = users[userIndex];
        const whoAmi = await user.api.account.whoAmi();
        expect(whoAmi.email).toEqual(email);
        expect(whoAmi.user_id).toBeTruthy();
        expect(whoAmi.username).toEqual(user.credentials.username);
        users[userIndex].id = whoAmi.user_id;
      }
    }
  });
  it("Enables settings", async () => {
    const user_settings: Array<UserSettingsType> = [
      "notification_on_approved",
      "notification_on_followed",
      "allow_search",
    ];
    for (const email in tokenMap) {
      if (Object.prototype.hasOwnProperty.call(tokenMap, email)) {
        for (const user_setting of user_settings) {
          const userIndex = users.findIndex(
            (a) => a.credentials.email == email
          );
          const user = users[userIndex];
          const isChanged = await user.api.settings.changeUserSettings(
            user_setting,
            true
          );
          expect(isChanged.enabled).toEqual(true);
          expect(isChanged.type).toEqual(user_setting);
          expect(isChanged.id).toBeTruthy();
        }
      }
    }
  });
  it("Checks settings", async () => {
    for (const email in tokenMap) {
      if (Object.prototype.hasOwnProperty.call(tokenMap, email)) {
        const userIndex = users.findIndex((a) => a.credentials.email == email);
        const user = users[userIndex];
        const settings = await user.api.settings.fetchUserSettings();
        expect(settings.length).toEqual(3);
        expect(settings[0].type).toEqual("notification_on_approved");
        expect(settings[0].enabled).toEqual(true);
      }
    }
  });
  it("Fetches user groups", async () => {
    for (const email in tokenMap) {
      if (Object.prototype.hasOwnProperty.call(tokenMap, email)) {
        const userIndex = users.findIndex((a) => a.credentials.email == email);
        const user = users[userIndex];
        const groups = await user.api.group.fetchGroups();
        expect(groups.length).toEqual(0);
      }
    }
  });
  it("Creates user group", async () => {
    for (const email in tokenMap) {
      if (Object.prototype.hasOwnProperty.call(tokenMap, email)) {
        const userIndex = users.findIndex((a) => a.credentials.email == email);
        const user = users[userIndex];
        const group = await user.api.group.createGroup("Followers", true);
        expect(group.id).toBeTruthy();
        const symKeya = await symDecrypt(user.encryption_key, group.sym_key);
        users[userIndex].keys.groupSymKey = symKeya.toString("base64");
      }
    }
  });
  it("Verifies groups are created", async () => {
    for (const email in tokenMap) {
      if (Object.prototype.hasOwnProperty.call(tokenMap, email)) {
        const userIndex = users.findIndex((a) => a.credentials.email == email);
        const user = users[userIndex];
        const groups = await user.api.group.fetchGroups();
        expect(groups.length).toEqual(1);
        const symKeya = await symDecrypt(
          user.encryption_key,
          groups[0].sym_key
        );
        expect(users[userIndex].keys.groupSymKey).toEqual(
          symKeya.toString("base64")
        );
        users[userIndex].groups = groups;
      }
    }
  });
  it("Check Ecdh Keys", async () => {
    for (const email in tokenMap) {
      if (Object.prototype.hasOwnProperty.call(tokenMap, email)) {
        const userIndex = users.findIndex((a) => a.credentials.email == email);
        const user = users[userIndex];
        await user.api.keys.getExistingEcdhKeys();
        expect(Object.keys(user.api.auth.ecdhKeys).length).toEqual(25);
        users[userIndex].keys.ecdhKeys = Object.values(
          user.api.auth.ecdhKeys
        ).map((a) => ({
          id: a.id,
          public_key: a.publicKey,
          private_key: a.privateKey,
        }));
      }
    }
  });
  it("Follows user", async () => {
    // User 1 send follow request to user2
    const user1 = users[0];
    const user2 = users[1];
    const ecdhKeyPair = user2.keys.ecdhKeys[0];
    const followUser = await user1.api.follow.followUser(
      user2.id,
      ecdhKeyPair.id,
      ecdhKeyPair.public_key
    );
    expect(followUser.is_approved).toEqual(false);
  });
  it("Searches user", async () => {
    const user1 = users[0];
    const user2 = users[1];
    const result = await user2.api.follow.searchUser(
      user1.credentials.username
    );
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual(user1.id);
  });
  it("Check notification for follow", async () => {
    const user1 = users[0];
    const user2 = users[1];
    const notifications = await user2.api.notifications.fetchNotifications();
    expect(notifications.length).toEqual(1);
    expect(notifications[0].content).toEqual(
      `${user1.credentials.username} asked to follow you`
    );
    expect(notifications[0].payload.username).toEqual(
      user1.credentials.username
    );
  });
  it("Check approvals and Approve users", async () => {
    const user1 = users[0];
    const user2 = users[1];
    const approvals = await user2.api.follow.fetchPendingApprovals();
    expect(approvals.total).toEqual(1);
    expect(approvals.data.length).toEqual(1);
    const data = approvals.data;
    expect(data[0].follower_id).toEqual(user1.id);
    const publicKey = data[0].public_key;
    const own_key_id = data[0].own_key_id;
    const first_name = data[0].first_name;
    const ownKeyPair = user2.keys.ecdhKeys.find((a) => a.id == own_key_id);
    expect(ownKeyPair).not.toBeNull();
    expect(first_name).toEqual(user1.profile.first_name);
    const symKey = await symEncrypt(
      user2.encryption_key,
      Buffer.from(user2.keys.groupSymKey, "base64")
    );
    const approved = await user2.api.follow.approveUser(
      data[0].id,
      publicKey,
      user2.groups[0].id,
      symKey,
      own_key_id,
      ownKeyPair.private_key
    );
    expect(approved).toBeTruthy();
    expect(approved.approved).toEqual(true);
  });
  it("Check followers", async () => {
    const user1 = users[0];
    const user2 = users[1];
    const followers = await user2.api.follow.fetchFollowers();
    expect(followers.total).toEqual(1);
    expect(followers.data.length).toEqual(1);
    expect(followers.data[0].user_id).toEqual(user1.id);
  });
  it("Check followees", async () => {
    const user1 = users[0];
    const user2 = users[1];
    const followees = await user1.api.follow.fetchFollowees();
    expect(followees.total).toEqual(1);
    expect(followees.data.length).toEqual(1);
    expect(followees.data[0].user_id).toEqual(user2.id);
  });
  it("Check notification for approved", async () => {
    const user1 = users[0];
    const user2 = users[1];
    const notifications = await user1.api.notifications.fetchNotifications();
    expect(notifications.length).toEqual(1);
    expect(notifications[0].content).toEqual(
      `${user2.credentials.username} has approved your follow request`
    );
    expect(notifications[0].payload.username).toEqual(
      user2.credentials.username
    );
  });
  it("Create new post", async () => {
    const user2 = users[1];
    const symKey = await symEncrypt(
      user2.encryption_key,
      Buffer.from(user2.keys.groupSymKey, "base64")
    );
    const data = "My First Post";
    const post = await user2.api.post.createPost(
      user2.groups[0].id,
      symKey,
      data,
      null,
      null
    );
    expect(post.id).toBeTruthy();
    expect(post.text_content).toBeTruthy();
  });
  it("Fetches user info", async () => {
    const user1 = users[0];
    const user2 = users[1];
    const userInfo = await user1.api.follow.fetchUserInfo(
      user2.credentials.username
    );
    expect(userInfo.username).toEqual(user2.credentials.username);
    expect(userInfo.first_name).toEqual(user2.profile.first_name);
  });
  it("Fetches user posts", async () => {
    const user1 = users[0];
    const user2 = users[1];
    const userPosts = await user1.api.feed.fetchUserPosts(
      user2.credentials.username,
      null
    );
    expect(userPosts.data.length).toEqual(1);
    expect(userPosts.data[0].user.username).toEqual(user2.credentials.username);
    expect(userPosts.data[0].user.first_name).toEqual(user2.profile.first_name);
    expect(userPosts.data[0].text_content).toEqual("My First Post");
  });
  it("Fetches Home feed", async () => {
    const user1 = users[0];
    const user2 = users[1];
    const homeFeed = await user1.api.feed.fetchHomeFeed(null);
    expect(homeFeed.data.length).toEqual(1);
    expect(homeFeed.data[0].user.username).toEqual(user2.credentials.username);
  });
  it("Deletes group", async () => {
    for (const email in tokenMap) {
      if (Object.prototype.hasOwnProperty.call(tokenMap, email)) {
        const userIndex = users.findIndex((a) => a.credentials.email == email);
        const user = users[userIndex];
        const deletedGroup = await user.api.group.deleteGroup(
          user.groups[0].id
        );
        expect(deletedGroup.deleted).toEqual(true);
      }
    }
  });
  it("Checks count", async () => {
    for (const email in tokenMap) {
      if (Object.prototype.hasOwnProperty.call(tokenMap, email)) {
        const userIndex = users.findIndex((a) => a.credentials.email == email);
        const user = users[userIndex];
        const counts = await user.api.account.fetchCounts();
        expect(counts.notifications).toEqual(1);
        expect(counts.settings).toEqual(3);
        expect(counts.groups).toEqual(0);
        expect(counts.followers).toEqual(0);
        expect(counts.followees).toEqual(0);
        expect(counts.approvals).toEqual(0);
        expect(counts.posts).toEqual(0);
      }
    }
  });
});
