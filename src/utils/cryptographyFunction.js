import crypto from "crypto";
import constVariable from "./constantVariables.js";
import { Buffer } from "buffer";

export const encryptRSAText = (text) => {
  try {
    let key = {
      key: constVariable.CRYPTOGRAPHY.RSA.PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    };
    let encryptedMessage = crypto
      .publicEncrypt(key, Buffer.from(text))
      .toString("base64");
    return encryptedMessage;
  } catch (error) {
    return null;
  }
};

export const decryptRSAText = (encrypted) => {
  try {
    let privatekey = {
      key: constVariable.CRYPTOGRAPHY.RSA.PRIVATE_KEY,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    };
    const decrypted = crypto.privateDecrypt(
      privatekey,
      Buffer.from(encrypted, "base64")
    );
    return decrypted.toString("utf8");
  } catch (error) {
    return null;
  }
};

export const compareAESText = (encrypted, plainText) => {
  try {
    let textParts = encrypted.split(":");
    let iv = Buffer.from(textParts.shift(), "hex");
    let cipher = crypto.createCipheriv(
      constVariable.CRYPTOGRAPHY.AES.ALGORITHM,
      Buffer.from(constVariable.CRYPTOGRAPHY.AES.KEY),
      iv
    );
    let plain_encrypted = cipher.update(plainText);
    plain_encrypted = Buffer.concat([plain_encrypted, cipher.final()]);
    return plain_encrypted.toString("hex") === textParts[0];
  } catch (error) {
    return null;
  }
};

export const encryptAESText = (text) => {
  try {
    let iv = crypto.randomBytes(constVariable.CRYPTOGRAPHY.AES.IV_LENGTH);
    let cipher = crypto.createCipheriv(
      constVariable.CRYPTOGRAPHY.AES.ALGORITHM,
      Buffer.from(constVariable.CRYPTOGRAPHY.AES.KEY),
      iv
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    return null;
  }
};

export const decryptAESText = (encrypted) => {
  try {
    let textParts = encrypted.split(":");
    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(constVariable.CRYPTOGRAPHY.AES.KEY),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    return null;
  }
};