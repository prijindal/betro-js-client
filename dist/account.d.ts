/// <reference types="node" />
import AuthController from "./auth";
import { CountResponse, UserProfileResponse, WhoAmiResponse } from "./types";
declare class AccountController {
    auth: AuthController;
    constructor(auth: AuthController);
    fetchProfilePicture: () => Promise<Buffer | null>;
    whoAmi: () => Promise<WhoAmiResponse | null>;
    fetchCounts: () => Promise<CountResponse | null>;
    fetchProfile: () => Promise<UserProfileResponse | null>;
    createProfile: (first_name: string, last_name: string, profile_picture: Buffer | null) => Promise<UserProfileResponse | null>;
    updateProfile: (first_name?: string, last_name?: string, profile_picture?: Buffer | null) => Promise<UserProfileResponse | null>;
}
export default AccountController;
