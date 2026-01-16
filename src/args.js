const DEFAULT_LENGTH = 32;
const MAX_LENGTH = 1024;
const MAX_BYTES = MAX_LENGTH / 2;
const MAX_COUNT = 100;

function parseArgs(argv) {
  let lengthValue = null;
  let bytes = null;
  let copy = false;
  let count = 1;
  let envName = null;
  let json = false;

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
        throw new Error("The --bytes option can only be specified once.");
      }
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) {
        throw new Error("Missing value for --bytes.");
      }
      bytes = next;
      i += 1;
      continue;
    }

    if (arg === "--copy" || arg === "-c") {
      copy = true;
      continue;
    }

    if (arg === "--count" || arg === "-n") {
      if (count !== 1) {
        throw new Error("The --count option can only be specified once.");
      }
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) {
        throw new Error("Missing value for --count.");
      }
      const parsedCount = parseCount(next);
      count = parsedCount;
      i += 1;
      continue;
    }

    if (arg === "--env" || arg === "-e") {
      if (envName != null) {
        throw new Error("The --env option can only be specified once.");
      }
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) {
        throw new Error("Missing value for --env.");
      }
      envName = parseEnvName(next);
      i += 1;
      continue;
    }

    if (arg === "--json" || arg === "-j") {
      json = true;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (lengthValue != null) {
      throw new Error("Multiple length values provided.");
    }

    lengthValue = arg;
  }

  return { action: "generate", lengthValue, bytes, copy, count, envName, json };
}

function parseCharacterLength(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    throw new Error(`Invalid length: '${value}'. Must be a positive integer.`);
  }
  if (num <= 0) {
    throw new Error("Length must be a positive integer.");
  }
  return num;
}

function parseByteLength(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    throw new Error(
      `Invalid byte length: '${value}'. Must be a positive integer.`
    );
  }
  if (num <= 0) {
    throw new Error("Byte length must be a positive integer.");
  }
  return num;
}

function parseCount(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    throw new Error(
      `Invalid count: '${value}'. Must be a positive integer.`
    );
  }
  if (num <= 0) {
    throw new Error("Count must be a positive integer.");
  }
  if (num > MAX_COUNT) {
    throw new Error(`Count exceeds maximum of ${MAX_COUNT}.`);
  }
  return num;
}

function parseEnvName(value) {
  if (!value || value.trim() === "") {
    throw new Error("Environment variable name cannot be empty.");
  }
  if (value.includes(" ")) {
    throw new Error("Environment variable name cannot contain spaces.");
  }
  return value;
}

module.exports = {
  DEFAULT_LENGTH,
  MAX_LENGTH,
  MAX_BYTES,
  MAX_COUNT,
  parseArgs,
  parseCharacterLength,
  parseByteLength,
  parseCount,
  parseEnvName
};
