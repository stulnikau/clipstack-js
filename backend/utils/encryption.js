const CryptoJS = require("crypto-js");

const encryptToken = (token) => {
  const ciphertext = CryptoJS.AES.encrypt(
    token,
    // process.env.ENCRYPTION_KEY
    "secret"
  ).toString();
  return ciphertext;
};

const decryptToken = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(
    ciphertext,
    // process.env.ENCRYPTION_KEY
    "secret"
  );
  const token = bytes.toString(CryptoJS.enc.Utf8);
  return token;
};

module.exports = {
  encryptToken,
  decryptToken,
};
