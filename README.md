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
hexpass --help
hexpass --version
hexpass --copy
```

- Default: `hexpass` outputs a 32-character hex string.
- `hexpass 64` outputs a 64-character string.
- `hexpass 33` supports odd lengths (generates extra byte and truncates).
- `hexpass --bytes 16` uses 16 random bytes (32 characters of hex).

## Options

| Option | Description |
| --- | --- |
| `length` | Desired hex string length (default 32, max 1024) |
| `--bytes <n>` | Generate from n bytes (output has n×2 characters) |
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
```

## Security

`hexpass` always uses `crypto.randomBytes()` from Node.js for cryptographically strong randomness. No weak sources like `Math.random()` are used.

## License

MIT
