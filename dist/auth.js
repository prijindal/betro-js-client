"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const betro_js_lib_1 = require("betro-js-lib");
class AuthController {
    constructor(host) {
        this.encryptionKey = "";
        this.token = "";
        this.privateKey = "";
        // public ecdhKeys: Array<{ id: string; publicKey: string; privateKey: string }> = [];
        this.ecdhKeys = {};
        this.isAuthenticated = () => {
            if (this.encryptionKey.length === 0 ||
                ((this.token == null || this.token.length === 0) &&
                    this.instance.defaults.headers["cookie"] === null)) {
                return false;
            }
            return true;
        };
        this.getHost = () => {
            return this.host;
        };
        this.getToken = () => {
            return this.token;
        };
        this.storeLocal = () => {
            localStorage.setItem("ENCRYPTION_KEY", this.encryptionKey);
            localStorage.setItem("TOKEN", this.token);
        };
        this.loadFromLocal = () => {
            const encryptionKey = localStorage.getItem("ENCRYPTION_KEY");
            const token = localStorage.getItem("TOKEN");
            if (encryptionKey != null && token != null) {
                this.encryptionKey = encryptionKey;
                this.token = token;
                this.instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                return true;
            }
            else {
                return false;
            }
        };
        this.logout = () => {
            this.instance = axios_1.default.create({ baseURL: this.host });
            localStorage.clear();
            this.encryptionKey = "";
            this.token = "";
            this.privateKey = "";
            this.symKey = null;
        };
        this.login = async (email, password, set_cookie = false) => {
            const masterKey = await betro_js_lib_1.getMasterKey(email, password);
            const masterHash = await betro_js_lib_1.getMasterHash(masterKey, password);
            const response = await this.instance.post(`/api/login?set_cookie=${set_cookie}`, {
                email,
                master_hash: masterHash,
            });
            this.encryptionKey = await betro_js_lib_1.getEncryptionKey(masterKey);
            const token = response.data.token;
            if (token != null) {
                this.token = token;
                this.instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            }
            return true;
        };
        this.isAvailableUsername = async (username) => {
            try {
                const response = await this.instance.get(`/api/register/available/username?username=${username}`);
                return response.data.available;
            }
            catch (e) {
                return false;
            }
        };
        this.isAvailableEmail = async (email) => {
            try {
                const response = await this.instance.get(`/api/register/available/email?email=${email}`);
                return response.data.available;
            }
            catch (e) {
                return false;
            }
        };
        this.register = async (username, email, password) => {
            const masterKey = await betro_js_lib_1.getMasterKey(email, password);
            const masterHash = await betro_js_lib_1.getMasterHash(masterKey, password);
            const encryptionKey = await betro_js_lib_1.getEncryptionKey(masterKey);
            const symKey = await betro_js_lib_1.generateSymKey();
            const encryptedSymKey = await betro_js_lib_1.symEncrypt(encryptionKey, Buffer.from(symKey, "base64"));
            const response = await this.instance.post("/api/register", {
                username,
                email,
                master_hash: masterHash,
                inhibit_login: true,
                sym_key: encryptedSymKey,
            });
            const token = response.data.token;
            this.encryptionKey = encryptionKey;
            if (token != null) {
                this.token = token;
                this.instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            }
            return true;
        };
        this.host = host;
        this.instance = axios_1.default.create({ baseURL: host });
    }
}
exports.default = AuthController;
//# sourceMappingURL=auth.js.map