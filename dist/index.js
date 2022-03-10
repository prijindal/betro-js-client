"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = __importDefault(require("./auth"));
const account_1 = __importDefault(require("./account"));
const follow_1 = __importDefault(require("./follow"));
const group_1 = __importDefault(require("./group"));
const feed_1 = __importDefault(require("./feed"));
const notifications_1 = __importDefault(require("./notifications"));
const settings_1 = __importDefault(require("./settings"));
const post_1 = __importDefault(require("./post"));
const keys_1 = __importDefault(require("./keys"));
const conversation_1 = __importDefault(require("./conversation"));
__exportStar(require("./types"), exports);
__exportStar(require("./bufferToImage"), exports);
class BetroApi {
    constructor(host) {
        this.host = host;
        this.auth = new auth_1.default(this.host);
    }
    get account() {
        return new account_1.default(this.auth);
    }
    get keys() {
        return new keys_1.default(this.auth);
    }
    get follow() {
        return new follow_1.default(this.auth);
    }
    get group() {
        return new group_1.default(this.auth);
    }
    get feed() {
        return new feed_1.default(this.auth);
    }
    get notifications() {
        return new notifications_1.default(this.auth);
    }
    get settings() {
        return new settings_1.default(this.auth);
    }
    get post() {
        return new post_1.default(this.auth);
    }
    get conversation() {
        return new conversation_1.default(this.auth);
    }
}
exports.default = BetroApi;
//# sourceMappingURL=index.js.map