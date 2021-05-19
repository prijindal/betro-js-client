import axios from "axios";

export const bufferToImageUrl = (buffer: Buffer): string => {
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

export const imageUrlToBuffer = async (url: string): Promise<Buffer> => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "utf-8");
  return buffer;
};
