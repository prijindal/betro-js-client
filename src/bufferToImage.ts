import axios from "axios";

export const bufferToImageUrl = (buffer: Buffer): string => {
  const arrayBufferView = new Uint8Array(buffer);
  const blob = new Blob([arrayBufferView], { type: "image/jpeg" });
  const urlCreator = window.URL || window.webkitURL;
  const imageUrl = urlCreator.createObjectURL(blob);
  return imageUrl;
};

export const imageUrlToBuffer = async (url: string): Promise<Buffer> => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "utf-8");
  return buffer;
};
