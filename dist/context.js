"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const index_1 = __importDefault(require("./index"));
const BetroApiObject = new index_1.default(constants_1.API_HOST);
exports.default = BetroApiObject;
//# sourceMappingURL=context.js.map