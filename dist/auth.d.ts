import { AxiosInstance } from "axios";
declare class AuthController {
    private host;
    encryptionKey: string;
    private token;
    privateKey: string;
    symKey: string;
    ecdhKeys: {
        [id: string]: {
            id: string;
            publicKey: string;
            privateKey: string;
            claimed: boolean;
        };
    };
    instance: AxiosInstance;
    constructor(host: string);
    isAuthenticated: () => boolean;
    storeLocal: () => void;
    loadFromLocal: () => boolean;
    logout: () => void;
    login: (email: string, password: string) => Promise<boolean>;
    isAvailableUsername: (username: string) => Promise<boolean>;
    isAvailableEmail: (email: string) => Promise<boolean>;
    register: (username: string, email: string, password: string) => Promise<boolean>;
}
export default AuthController;
