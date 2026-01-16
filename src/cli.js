const {
  DEFAULT_LENGTH,
  MAX_LENGTH,
  MAX_BYTES,
  parseArgs,
  parseCharacterLength,
  parseByteLength
} = require("./args");
const { generateSecrets, bytesUsed } = require("./generator");
const { formatPlain, formatJson, copyToClipboard } = require("./output");
const { getHelp } = require("./help");
const { version } = require("../package.json");

function run(argv, stdout, stderr, exit) {
  try {
    const parsed = parseArgs(argv);

    if (parsed.action === "help") {
      stdout.write(getHelp() + "\n");
      exit(0);
      return;
    }

    if (parsed.action === "version") {
      stdout.write(version + "\n");
      exit(0);
      return;
    }

    if (parsed.bytes != null && parsed.lengthValue != null) {
      throw new Error("Provide either a length or --bytes, not both.");
    }

    if (parsed.count > 1 && parsed.envName != null) {
      throw new Error("The --env option is only supported for single secret generation (count=1).");
    }

    if (parsed.count > 1 && parsed.copy) {
      throw new Error("Copy is only supported for single secret.");
    }

    if (parsed.json && parsed.count > 1) {
      throw new Error("JSON mode is only supported for single secret generation (count=1).");
    }

    if (parsed.json && parsed.envName != null) {
      throw new Error("JSON mode is not compatible with --env. Use JSON output directly for structured data.");
    }

    if (parsed.json && parsed.copy) {
      throw new Error("JSON mode is not compatible with --copy. Use JSON output for automation.");
    }

    let charLength;
    let cachedByteLength = null;

    if (parsed.bytes != null) {
      cachedByteLength = parseByteLength(parsed.bytes);
      if (cachedByteLength * 2 > MAX_LENGTH) {
        throw new Error(
          `Byte length exceeds maximum of ${MAX_BYTES} bytes (${MAX_LENGTH} characters).`
        );
      }
      charLength = cachedByteLength * 2;
    } else if (parsed.lengthValue != null) {
      const length = parseCharacterLength(parsed.lengthValue);
      if (length > MAX_LENGTH) {
        throw new Error(`Length exceeds maximum of ${MAX_LENGTH} characters.`);
      }
      charLength = length;
    } else {
      charLength = DEFAULT_LENGTH;
    }

    const secrets = generateSecrets(charLength, parsed.count);

    if (parsed.json) {
      const bytes = bytesUsed(charLength, cachedByteLength);
      const jsonOutput = formatJson(secrets[0], charLength, bytes);
      stdout.write(jsonOutput + "\n");
    } else {
      const output = formatPlain(secrets, parsed.envName);
      stdout.write(output + "\n");

      if (parsed.copy) {
        try {
          copyToClipboard(secrets[0]);
        } catch (error) {
          throw new Error(error.message || "Failed to copy to clipboard.");
        }
      }
    }

    exit(0);
  } catch (error) {
    stderr.write(`Error: ${error.message}\n`);
    exit(1);
  }
}

module.exports = {
  run
};
