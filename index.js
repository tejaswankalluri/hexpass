#!/usr/bin/env node

const crypto = require("crypto");
const { spawnSync } = require("child_process");
const { version } = require("./package.json");

const DEFAULT_LENGTH = 32;
const MAX_LENGTH = 1024;
const MAX_BYTES = MAX_LENGTH / 2;

const args = process.argv.slice(2);

const parsed = parseArgs(args);

if (parsed.action === "help") {
  printHelp();
  process.exit(0);
}

if (parsed.action === "version") {
  console.log(version);
  process.exit(0);
}

if (parsed.bytes != null && parsed.lengthValue != null) {
  exitWithError("Provide either a length or --bytes, not both.");
}

let charLength;

if (parsed.bytes != null) {
  const byteLength = parseByteLength(parsed.bytes);
  if (byteLength * 2 > MAX_LENGTH) {
    exitWithError(
      `Byte length exceeds maximum of ${MAX_BYTES} bytes (${MAX_LENGTH} characters).`
    );
  }
  charLength = byteLength * 2;
} else if (parsed.lengthValue != null) {
  const length = parseCharacterLength(parsed.lengthValue);
  if (length > MAX_LENGTH) {
    exitWithError(`Length exceeds maximum of ${MAX_LENGTH} characters.`);
  }
  charLength = length;
} else {
  charLength = DEFAULT_LENGTH;
}

const password = generateHex(charLength);
process.stdout.write(`${password}\n`);

if (parsed.copy) {
  try {
    copyToClipboard(password);
  } catch (error) {
    exitWithError(error.message || "Failed to copy to clipboard.");
  }
}

function parseArgs(argv) {
  let lengthValue = null;
  let bytes = null;
  let copy = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      return { action: "help" };
    }

    if (arg === "--version" || arg === "-v") {
      return { action: "version" };
    }

    if (arg === "--bytes") {
      if (bytes != null) {
        exitWithError("The --bytes option can only be specified once.");
      }
      const next = argv[i + 1];
      if (!next) {
        exitWithError("Missing value for --bytes.");
      }
      bytes = next;
      i += 1;
      continue;
    }

    if (arg === "--copy" || arg === "-c") {
      copy = true;
      continue;
    }

    if (arg.startsWith("--")) {
      exitWithError(`Unknown option: ${arg}`);
    }

    if (lengthValue != null) {
      exitWithError("Multiple length values provided.");
    }

    lengthValue = arg;
  }

  return { action: "generate", lengthValue, bytes, copy };
}

function parseCharacterLength(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    exitWithError(`Invalid length: '${value}'. Must be a positive integer.`);
  }
  if (num <= 0) {
    exitWithError("Length must be a positive integer.");
  }
  return num;
}

function parseByteLength(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    exitWithError(
      `Invalid byte length: '${value}'. Must be a positive integer.`
    );
  }
  if (num <= 0) {
    exitWithError("Byte length must be a positive integer.");
  }
  return num;
}

function generateHex(charLength) {
  const bytesNeeded = Math.ceil(charLength / 2);
  const hex = crypto.randomBytes(bytesNeeded).toString("hex");
  return hex.slice(0, charLength);
}

function printHelp() {
  console.log(
    `hexpass - Generate cryptographically secure hex passwords\n\n` +
      `Usage:\n` +
      `  hexpass [length]        Generate hex string with specified length (default: ${DEFAULT_LENGTH})\n` +
      `  hexpass --bytes <n>     Generate from n random bytes (output has n*2 characters)\n\n` +
      `Options:\n` +
      `  -h, --help             Show this help message\n` +
      `  -v, --version          Show version number\n` +
      `  -c, --copy             Copy the generated hex string to clipboard\n` +
      `  --bytes <n>            Specify length in bytes instead of characters\n\n` +
      `Examples:\n` +
      `  hexpass               # 32-character hex string\n` +
      `  hexpass 64            # 64-character hex string\n` +
      `  hexpass --bytes 32    # 64-character hex string (32 bytes)\n` +
      `  hexpass 48 --copy     # Generate 48 chars and copy to clipboard\n\n` +
      `Limits:\n` +
      `  Maximum output length is ${MAX_LENGTH} characters (${MAX_BYTES} bytes).\n\n` +
      `Security:\n` +
      `  All passwords are generated using Node.js crypto.randomBytes()`
  );
}

function exitWithError(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function copyToClipboard(text) {
  const platform = process.platform;

  if (platform === "darwin") {
    runClipboardCommand("pbcopy", text);
    return;
  }

  if (platform === "win32") {
    runClipboardCommand("clip", text);
    return;
  }

  const linuxCommands = [
    ["xclip", ["-selection", "clipboard"]],
    ["xsel", ["--clipboard", "--input"]],
  ];

  for (const [cmd, args] of linuxCommands) {
    const result = spawnSync(cmd, args, { input: text, encoding: "utf8" });
    if (!result.error && result.status === 0) {
      return;
    }
  }

  throw new Error(
    "Clipboard copy not supported on this system. Install xclip or xsel."
  );
}

function runClipboardCommand(command, input) {
  const result = spawnSync(command, [], { input, encoding: "utf8" });
  if (result.error || result.status !== 0) {
    throw new Error(`Failed to copy to clipboard using ${command}.`);
  }
}
