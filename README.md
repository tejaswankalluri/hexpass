# hexpass

Generate cryptographically secure hexadecimal passwords and secrets.

## Install

Using npm:

```
npm install -g hexpass
```

Or run directly with npx:

```
npx hexpass
```

## Usage

```
hexpass [length]
hexpass --bytes <n>
hexpass --count <n>
hexpass --env <NAME>
hexpass --json
hexpass --help
hexpass --version
```

- Default: `hexpass` outputs a 32-character hex string.
- `hexpass 64` outputs a 64-character string.
- `hexpass 33` supports odd lengths (generates extra byte and truncates).
- `hexpass --bytes 16` uses 16 random bytes (32 characters of hex).
- `hexpass 32 --count 5` generates 5 secrets, each on its own line.
- `hexpass 48 --env JWT_SECRET` outputs `JWT_SECRET=<secret>` format.
- `hexpass 32 --json` outputs a JSON object with length, bytes, and hex fields (single secret only).

## Options

| Option | Description |
| --- | --- |
| `length` | Desired hex string length (default 32, max 1024) |
| `--bytes <n>` | Generate from n bytes (output has n×2 characters) |
| `--count <n>`, `-n` | Generate n secrets (default 1, max 100) |
| `--env <NAME>`, `-e` | Output as NAME=secret instead of raw secret |
| `--json`, `-j` | Output as JSON object (single secret only; incompatible with --env and --copy) |
| `--copy`, `-c` | Copy the generated hex string to the clipboard |
| `--help`, `-h` | Show usage information |
| `--version`, `-v` | Show version number |

## Examples

```
# Quickly generate a secret
hexpass 64

# Populate .env
JWT_SECRET=$(hexpass 48)

# Create API key
hexpass --bytes 32 > api-key.txt

# Generate and copy instantly
hexpass 48 --copy

# Generate multiple secrets at once
hexpass 32 --count 5

# Output as environment variable format
hexpass 48 --env JWT_SECRET
# Output: JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Output as JSON for automation
hexpass 32 --json
# Output: {"length":32,"bytes":16,"hex":"a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"}
```

## Security

`hexpass` always uses `crypto.randomBytes()` from Node.js for cryptographically strong randomness. No weak sources like `Math.random()` are used.

## License

MIT
