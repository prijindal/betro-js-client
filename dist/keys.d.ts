import AuthController from "./auth";
declare class KeysController {
    auth: AuthController;
    constructor(auth: AuthController);
    fetchKeys: () => Promise<boolean>;
    generateEcdhKeys: (n: number) => Promise<void>;
    getExistingEcdhKeys: () => Promise<void>;
}
export default KeysController;
