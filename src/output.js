const { spawnSync } = require("child_process");

function formatPlain(secrets, envName) {
  const output = secrets.map(secret => {
    if (envName != null) {
      return `${envName}=${secret}`;
    }
    return secret;
  }).join("\n");
  return output;
}

function formatJson(secret, charLength, bytesValue) {
  return JSON.stringify({
    length: charLength,
    bytes: bytesValue,
    hex: secret
  });
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

module.exports = {
  formatPlain,
  formatJson,
  copyToClipboard
};
