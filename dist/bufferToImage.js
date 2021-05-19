"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUrlToBuffer = exports.bufferToImageUrl = void 0;
const axios_1 = __importDefault(require("axios"));
const bufferToImageUrl = (buffer) => {
    const arrayBufferView = new Uint8Array(buffer);
    if (window.Blob != null) {
        const blob = new window.Blob([arrayBufferView], { type: "image/jpeg" });
        const urlCreator = window.URL || window.webkitURL;
        if (urlCreator != null) {
            const imageUrl = urlCreator.createObjectURL(blob);
            return imageUrl;
        }
    }
    return "";
};
exports.bufferToImageUrl = bufferToImageUrl;
const imageUrlToBuffer = async (url) => {
    const response = await axios_1.default.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "utf-8");
    return buffer;
};
exports.imageUrlToBuffer = imageUrlToBuffer;
//# sourceMappingURL=bufferToImage.js.map