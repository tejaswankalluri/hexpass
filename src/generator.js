const crypto = require("crypto");

function generateSecrets(charLength, count) {
  const secrets = [];
  for (let i = 0; i < count; i += 1) {
    const secret = generateHex(charLength);
    secrets.push(secret);
  }
  return secrets;
}

function generateHex(charLength) {
  const bytesNeeded = Math.ceil(charLength / 2);
  const hex = crypto.randomBytes(bytesNeeded).toString("hex");
  return hex.slice(0, charLength);
}

function bytesUsed(charLength, inputBytes) {
  if (inputBytes != null) {
    return inputBytes;
  }
  return Math.ceil(charLength / 2);
}

module.exports = {
  generateSecrets,
  bytesUsed
};
