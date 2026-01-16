const { DEFAULT_LENGTH, MAX_LENGTH, MAX_BYTES, MAX_COUNT } = require("./args");

function getHelp() {
  return (
    `hexpass - Generate cryptographically secure hex passwords\n\n` +
    `Usage:\n` +
    `  hexpass [length]        Generate hex string with specified length (default: ${DEFAULT_LENGTH})\n` +
    `  hexpass --bytes <n>     Generate from n random bytes (output has n*2 characters)\n` +
    `  hexpass --count <n>     Generate n secrets (default: 1, max: ${MAX_COUNT})\n` +
    `  hexpass --env <NAME>    Output as NAME=secret instead of raw secret\n` +
    `  hexpass --json          Output as JSON object (single secret only)\n\n` +
    `Options:\n` +
    `  -h, --help             Show this help message\n` +
    `  -v, --version          Show version number\n` +
    `  -c, --copy             Copy the generated hex string to clipboard (single secret only)\n` +
    `  -n, --count <n>        Generate n secrets (default: 1, max: ${MAX_COUNT})\n` +
    `  -e, --env <NAME>       Output as NAME=secret (single secret only)\n` +
    `  -j, --json             Output as JSON object (single secret only, incompatible with --env and --copy)\n` +
    `  --bytes <n>            Specify length in bytes instead of characters\n\n` +
    `Examples:\n` +
    `  hexpass               # 32-character hex string\n` +
    `  hexpass 64            # 64-character hex string\n` +
    `  hexpass --bytes 32    # 64-character hex string (32 bytes)\n` +
    `  hexpass 48 --copy     # Generate 48 chars and copy to clipboard\n` +
    `  hexpass 32 --count 5  # Generate 5 secrets, each 32 characters\n` +
    `  hexpass 48 --env JWT_SECRET  # Output as JWT_SECRET=<secret>\n` +
    `  hexpass 32 --json     # Output as JSON with length, bytes, and hex fields\n\n` +
    `Limits:\n` +
    `  Maximum output length is ${MAX_LENGTH} characters (${MAX_BYTES} bytes).\n` +
    `  Maximum count is ${MAX_COUNT} secrets.\n\n` +
    `Security:\n` +
    `  All passwords are generated using Node.js crypto.randomBytes()`
  );
}

module.exports = {
  getHelp
};
