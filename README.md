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
- `hexpass 33` supports odd lengths (generates the necessary extra byte and truncates to the requested number of hex characters).
- `hexpass --bytes 16` uses 16 random bytes (32 hex characters).
- `hexpass 32 --count 5` generates 5 secrets, each on its own line.
- `hexpass 48 --env JWT_SECRET` outputs `JWT_SECRET=<secret>` format.
- `hexpass 32 --json` outputs a JSON object with `length`, `bytes`, and `hex` fields (single secret only).

## Options

| Option | Description |
| --- | --- |
| `length` | Desired hex string length (default 32, max 1024) |
| `--bytes <n>` | Generate from n bytes (output has n×2 characters) |
| `--count <n>`, `-n` | Generate n secrets (default 1, max 100) |
| `--env <NAME>`, `-e` | Output as `NAME=secret` instead of raw secret (only valid for single secret) |
| `--json`, `-j` | Output as JSON object (single secret only; incompatible with `--env` and `--copy`) |
| `--copy`, `-c` | Copy the generated hex string to the clipboard (single secret only) |
| `--help`, `-h` | Show usage information |
| `--version`, `-v` | Show version number |

### Notes on compatibility

- `--json` is only supported for single-secret output (`--count` must be 1).
- `--env` and `--json` are incompatible — use one or the other depending on whether you want an assignment string or structured data.
- `--copy` works only for single-secret output and is incompatible with `--json`.

## Examples

```
# Quickly generate a secret (default 32 chars)
hexpass

# Generate a longer secret
hexpass 64

# Use explicit byte count (generates n * 2 hex chars)
hexpass --bytes 32 > api-key.txt

# Generate and copy a secret (single secret)
hexpass 48 --copy

# Generate multiple secrets in one go
hexpass 32 --count 5

# Output as environment variable format
hexpass 48 --env JWT_SECRET
# Output: JWT_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f

# Output as JSON for automation (single secret)
hexpass 32 --json
# Output: {"length":32,"bytes":16,"hex":"a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"}
```

## Security

`hexpass` always uses `crypto.randomBytes()` from Node.js for cryptographically strong randomness. No weak sources like `Math.random()` are used.

## Testing

The repository includes a small CLI test script used during development. You can exercise common invocations with:

```
npm test
```

This runs several `hexpass` variants to validate behavior (lengths, bytes, `--count`, `--env`, and `--json`).

## Version

This README reflects the changes introduced in version 1.0.1 (modular refactor and new CLI options).

## License

MIT
