"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const betro_js_lib_1 = require("betro-js-lib");
const times_1 = __importDefault(require("lodash/times"));
class KeysController {
    constructor(auth) {
        this.fetchKeys = async () => {
            if (!this.auth.isAuthenticated())
                return false;
            const response = await this.auth.instance.get("api/keys?include_echd_counts=true");
            const data = response.data;
            const ecdh_max_keys = data.ecdh_max_keys;
            const ecdh_unclaimed_keys = data.ecdh_unclaimed_keys;
            if (ecdh_unclaimed_keys > 0) {
                this.getExistingEcdhKeys();
            }
            if (ecdh_unclaimed_keys < ecdh_max_keys) {
                this.generateEcdhKeys(ecdh_max_keys / 2 - ecdh_unclaimed_keys);
            }
            const encryptedSymKey = data.sym_key;
            const symKey = await (0, betro_js_lib_1.symDecrypt)(this.auth.encryptionKey, encryptedSymKey);
            if (symKey != null) {
                this.auth.symKey = symKey;
                return true;
            }
            return false;
        };
        this.generateEcdhKeys = async (n) => {
            if (n <= 0) {
                return;
            }
            const keyPairs = await Promise.all((0, times_1.default)(n).map(() => (0, betro_js_lib_1.generateExchangePair)()));
            const keyPairMappings = {};
            for (const keyPair of keyPairs) {
                keyPairMappings[keyPair.publicKey] = keyPair.privateKey;
            }
            const encryptedKeyPairs = await Promise.all(keyPairs.map(async ({ publicKey, privateKey }) => {
                const privKey = await (0, betro_js_lib_1.symEncrypt)(this.auth.encryptionKey, Buffer.from(privateKey, "base64"));
                return {
                    public_key: publicKey,
                    private_key: privKey,
                };
            }));
            const response = await this.auth.instance.post("api/keys/ecdh/upload", {
                keys: encryptedKeyPairs,
            });
            const data = response.data;
            for (const iterator of data) {
                if (keyPairMappings[iterator.public_key]) {
                    this.auth.ecdhKeys[iterator.id] = {
                        id: iterator.id,
                        publicKey: iterator.public_key,
                        claimed: iterator.claimed,
                        privateKey: keyPairMappings[iterator.public_key],
                    };
                }
            }
        };
        this.getExistingEcdhKeys = async () => {
            const response = await this.auth.instance.get("api/keys/ecdh?include_types=unclaimed");
            const encryptedKeyPairs = response.data;
            for (const encryptedKeyPair of encryptedKeyPairs) {
                const { id, public_key, private_key, claimed } = encryptedKeyPair;
                const privateKey = await (0, betro_js_lib_1.symDecrypt)(this.auth.encryptionKey, private_key);
                if (privateKey != null) {
                    this.auth.ecdhKeys[id] = {
                        id,
                        publicKey: public_key,
                        claimed,
                        privateKey: privateKey === null || privateKey === void 0 ? void 0 : privateKey.toString("base64"),
                    };
                }
            }
        };
        this.auth = auth;
    }
}
exports.default = KeysController;
//# sourceMappingURL=keys.js.map