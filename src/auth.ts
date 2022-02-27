import axios, { AxiosInstance } from "axios";
import {
  generateSymKey,
  getEncryptionKey,
  getMasterHash,
  getMasterKey,
  symEncrypt,
} from "@betro/lib";

class AuthController {
  private host: string;
  public encryptionKey = "";
  private token = "";
  public privateKey = "";
  public symKey: Buffer;
  // public ecdhKeys: Array<{ id: string; publicKey: string; privateKey: string }> = [];
  public ecdhKeys: {
    [id: string]: {
      id: string;
      publicKey: string;
      privateKey: string;
      claimed: boolean;
    };
  } = {};
  public instance: AxiosInstance;
  constructor(host: string) {
    this.host = host;
    this.instance = axios.create({ baseURL: host });
  }

  isAuthenticated = (): boolean => {
    if (
      this.encryptionKey.length === 0 ||
      ((this.token == null || this.token.length === 0) &&
        this.instance.defaults.headers.get["cookie"] === null)
    ) {
      return false;
    }
    return true;
  };

  getHost = (): string => {
    return this.host;
  };

  getToken = (): string => {
    return this.token;
  };

  storeLocal = () => {
    localStorage.setItem("ENCRYPTION_KEY", this.encryptionKey);
    localStorage.setItem("TOKEN", this.token);
  };

  loadFromLocal = (): boolean => {
    const encryptionKey = localStorage.getItem("ENCRYPTION_KEY");
    const token = localStorage.getItem("TOKEN");
    if (encryptionKey != null && token != null) {
      this.encryptionKey = encryptionKey;
      this.token = token;
      this.instance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      return true;
    } else {
      return false;
    }
  };

  logout = () => {
    this.instance = axios.create({ baseURL: this.host });
    localStorage.clear();
    this.encryptionKey = "";
    this.token = "";
    this.privateKey = "";
    this.symKey = null;
  };

  login = async (
    email: string,
    password: string,
    set_cookie: boolean = false
  ): Promise<boolean> => {
    const masterKey = await getMasterKey(email, password);
    const masterHash = await getMasterHash(masterKey, password);
    const response = await this.instance.post(
      `/api/login?set_cookie=${set_cookie}`,
      {
        email,
        master_hash: masterHash,
      }
    );
    this.encryptionKey = await getEncryptionKey(masterKey);
    const token = response.data.token;
    if (token != null) {
      this.token = token;
      this.instance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    }
    return true;
  };

  isAvailableUsername = async (username: string): Promise<boolean> => {
    try {
      const response = await this.instance.get(
        `/api/register/available/username?username=${username}`
      );
      return response.data.available;
    } catch (e) {
      return false;
    }
  };

  isAvailableEmail = async (email: string): Promise<boolean> => {
    try {
      const response = await this.instance.get(
        `/api/register/available/email?email=${email}`
      );
      return response.data.available;
    } catch (e) {
      return false;
    }
  };

  register = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    const masterKey = await getMasterKey(email, password);
    const masterHash = await getMasterHash(masterKey, password);
    const encryptionKey = await getEncryptionKey(masterKey);
    const symKey = await generateSymKey();
    const encryptedSymKey = await symEncrypt(
      encryptionKey,
      Buffer.from(symKey, "base64")
    );
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
      this.instance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    }
    return true;
  };
}

export default AuthController;
