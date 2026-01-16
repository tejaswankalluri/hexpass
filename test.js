#!/usr/bin/env node

const { spawn } = require('child_process');
const { run } = require('./src/cli');

// Test utilities
let passedTests = 0;
let failedTests = 0;
const failures = [];

class TestOutput {
  constructor() {
    this.stdout = '';
    this.stderr = '';
  }

  writeStdout(data) {
    this.stdout += data;
  }

  writeStderr(data) {
    this.stderr += data;
  }
}

function runCLI(args) {
  return new Promise((resolve) => {
    const output = new TestOutput();
    let exitCode = null;

    run(
      args,
      { write: (data) => output.writeStdout(data) },
      { write: (data) => output.writeStderr(data) },
      (code) => { exitCode = code; }
    );

    resolve({
      stdout: output.stdout,
      stderr: output.stderr,
      exitCode
    });
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected} but got ${actual}`);
  }
}

function assertMatch(value, pattern, message) {
  if (!pattern.test(value)) {
    throw new Error(message || `Expected ${value} to match ${pattern}`);
  }
}

function assertContains(haystack, needle, message) {
  if (!haystack.includes(needle)) {
    throw new Error(message || `Expected "${haystack}" to contain "${needle}"`);
  }
}

async function test(name, fn) {
  try {
    await fn();
    passedTests++;
    process.stdout.write('.');
  } catch (error) {
    failedTests++;
    failures.push({ name, error: error.message });
    process.stdout.write('F');
  }
}

async function runTests() {
  console.log('Running hexpass CLI tests...\n');

  // Test 1: Basic generation with default length
  await test('Default generation', async () => {
    const result = await runCLI([]);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertMatch(result.stdout.trim(), /^[0-9a-f]{32}$/, 'Should generate 32-char hex string');
  });

  // Test 2: Custom length
  await test('Custom length 16', async () => {
    const result = await runCLI(['16']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertMatch(result.stdout.trim(), /^[0-9a-f]{16}$/, 'Should generate 16-char hex string');
  });

  // Test 3: Custom length 64
  await test('Custom length 64', async () => {
    const result = await runCLI(['64']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertMatch(result.stdout.trim(), /^[0-9a-f]{64}$/, 'Should generate 64-char hex string');
  });

  // Test 4: Invalid length - zero
  await test('Invalid length 0', async () => {
    const result = await runCLI(['0']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Length must be a positive integer');
  });

  // Test 5: Invalid length - negative
  await test('Invalid length -1', async () => {
    const result = await runCLI(['-1']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Unknown option');
  });

  // Test 6: Invalid length - non-numeric
  await test('Invalid length abc', async () => {
    const result = await runCLI(['abc']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Invalid length');
  });

  // Test 7: Length exceeds maximum
  await test('Length exceeds maximum', async () => {
    const result = await runCLI(['1025']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Length exceeds maximum of 1024');
  });

  // Test 8: Maximum valid length
  await test('Maximum valid length 1024', async () => {
    const result = await runCLI(['1024']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertMatch(result.stdout.trim(), /^[0-9a-f]{1024}$/, 'Should generate 1024-char hex string');
  });

  // Test 9: Minimum valid length
  await test('Minimum valid length 1', async () => {
    const result = await runCLI(['1']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertMatch(result.stdout.trim(), /^[0-9a-f]{1}$/, 'Should generate 1-char hex string');
  });

  // Test 10: --bytes option
  await test('--bytes 16', async () => {
    const result = await runCLI(['--bytes', '16']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertMatch(result.stdout.trim(), /^[0-9a-f]{32}$/, 'Should generate 32-char hex string (16 bytes)');
  });

  // Test 11: --bytes with invalid value
  await test('--bytes with invalid value', async () => {
    const result = await runCLI(['--bytes', 'abc']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Invalid byte length');
  });

  // Test 12: --bytes zero
  await test('--bytes 0', async () => {
    const result = await runCLI(['--bytes', '0']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Byte length must be a positive integer');
  });

  // Test 13: --bytes exceeds maximum
  await test('--bytes exceeds maximum', async () => {
    const result = await runCLI(['--bytes', '513']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Byte length exceeds maximum');
  });

  // Test 14: --bytes without value
  await test('--bytes without value', async () => {
    const result = await runCLI(['--bytes']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Missing value for --bytes');
  });

  // Test 15: --bytes specified twice
  await test('--bytes specified twice', async () => {
    const result = await runCLI(['--bytes', '16', '--bytes', '32']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'The --bytes option can only be specified once');
  });

  // Test 16: Both length and --bytes
  await test('Both length and --bytes', async () => {
    const result = await runCLI(['32', '--bytes', '16']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Provide either a length or --bytes, not both');
  });

  // Test 17: Maximum valid bytes
  await test('Maximum valid --bytes 512', async () => {
    const result = await runCLI(['--bytes', '512']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertMatch(result.stdout.trim(), /^[0-9a-f]{1024}$/, 'Should generate 1024-char hex string (512 bytes)');
  });

  // Test 18: Minimum valid bytes
  await test('Minimum valid --bytes 1', async () => {
    const result = await runCLI(['--bytes', '1']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertMatch(result.stdout.trim(), /^[0-9a-f]{2}$/, 'Should generate 2-char hex string (1 byte)');
  });

  // Test 19: --count option
  await test('--count 5', async () => {
    const result = await runCLI(['--count', '5']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    const lines = result.stdout.trim().split('\n');
    assertEqual(lines.length, 5, 'Should generate 5 secrets');
    lines.forEach(line => {
      assertMatch(line, /^[0-9a-f]{32}$/, 'Each line should be a 32-char hex string');
    });
  });

  // Test 20: --count with custom length
  await test('--count 2 with length 16', async () => {
    const result = await runCLI(['16', '--count', '2']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    const lines = result.stdout.trim().split('\n');
    assertEqual(lines.length, 2, 'Should generate 2 secrets');
    lines.forEach(line => {
      assertMatch(line, /^[0-9a-f]{16}$/, 'Each line should be a 16-char hex string');
    });
  });

  // Test 21: --count zero
  await test('--count 0', async () => {
    const result = await runCLI(['--count', '0']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Count must be a positive integer');
  });

  // Test 22: --count exceeds maximum
  await test('--count exceeds maximum', async () => {
    const result = await runCLI(['--count', '101']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Count exceeds maximum of 100');
  });

  // Test 23: --count without value
  await test('--count without value', async () => {
    const result = await runCLI(['--count']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Missing value for --count');
  });

  // Test 24: --count specified twice
  await test('--count specified twice', async () => {
    const result = await runCLI(['--count', '5', '--count', '10']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'The --count option can only be specified once');
  });

  // Test 25: Maximum valid count
  await test('Maximum valid --count 100', async () => {
    const result = await runCLI(['--count', '100']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    const lines = result.stdout.trim().split('\n');
    assertEqual(lines.length, 100, 'Should generate 100 secrets');
  });

  // Test 26: --env option
  await test('--env TEST', async () => {
    const result = await runCLI(['--env', 'TEST']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertMatch(result.stdout.trim(), /^TEST=[0-9a-f]{32}$/, 'Should format as env variable');
  });

  // Test 27: --env with custom length
  await test('--env TEST with length 16', async () => {
    const result = await runCLI(['16', '--env', 'TEST']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertMatch(result.stdout.trim(), /^TEST=[0-9a-f]{16}$/, 'Should format as env variable with 16-char hex');
  });

  // Test 28: --env without value
  await test('--env without value', async () => {
    const result = await runCLI(['--env']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Missing value for --env');
  });

  // Test 29: --env with empty string
  await test('--env with empty string', async () => {
    const result = await runCLI(['--env', '']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Missing value for --env');
  });

  // Test 30: --env with spaces
  await test('--env with spaces', async () => {
    const result = await runCLI(['--env', 'with spaces']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Environment variable name cannot contain spaces');
  });

  // Test 31: --env with --count
  await test('--env with --count', async () => {
    const result = await runCLI(['--env', 'TEST', '--count', '2']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'The --env option is only supported for single secret generation');
  });

  // Test 32: --env specified twice
  await test('--env specified twice', async () => {
    const result = await runCLI(['--env', 'TEST', '--env', 'VAR']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'The --env option can only be specified once');
  });

  // Test 33: --json option
  await test('--json', async () => {
    const result = await runCLI(['--json']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    const json = JSON.parse(result.stdout.trim());
    assert(json.length === 32, 'Should have length 32');
    assert(json.bytes === 16, 'Should have bytes 16');
    assertMatch(json.hex, /^[0-9a-f]{32}$/, 'Should have valid hex string');
  });

  // Test 34: --json with custom length
  await test('--json with length 16', async () => {
    const result = await runCLI(['16', '--json']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    const json = JSON.parse(result.stdout.trim());
    assert(json.length === 16, 'Should have length 16');
    assert(json.bytes === 8, 'Should have bytes 8');
    assertMatch(json.hex, /^[0-9a-f]{16}$/, 'Should have valid hex string');
  });

  // Test 35: --json with --bytes
  await test('--json with --bytes 16', async () => {
    const result = await runCLI(['--bytes', '16', '--json']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    const json = JSON.parse(result.stdout.trim());
    assert(json.length === 32, 'Should have length 32');
    assert(json.bytes === 16, 'Should have bytes 16');
    assertMatch(json.hex, /^[0-9a-f]{32}$/, 'Should have valid hex string');
  });

  // Test 36: --json with --count
  await test('--json with --count', async () => {
    const result = await runCLI(['--json', '--count', '2']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'JSON mode is only supported for single secret generation');
  });

  // Test 37: --json with --env
  await test('--json with --env', async () => {
    const result = await runCLI(['--env', 'TEST', '--json']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'JSON mode is not compatible with --env');
  });

  // Test 38: --json with --copy
  await test('--json with --copy', async () => {
    const result = await runCLI(['--json', '--copy']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'JSON mode is not compatible with --copy');
  });

  // Test 39: --copy option (basic test - may not work in all environments)
  await test('--copy option', async () => {
    const result = await runCLI(['--copy']);
    // Exit code might be 0 or 1 depending on clipboard availability
    // Just verify it doesn't crash
    assert(result.exitCode === 0 || result.exitCode === 1, 'Should exit with valid code');
  });

  // Test 40: --copy with --count
  await test('--copy with --count', async () => {
    const result = await runCLI(['--count', '2', '--copy']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Copy is only supported for single secret');
  });

  // Test 41: --help option
  await test('--help', async () => {
    const result = await runCLI(['--help']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertContains(result.stdout, 'hexpass');
    assertContains(result.stdout, 'Usage');
  });

  // Test 42: -h option
  await test('-h option', async () => {
    const result = await runCLI(['-h']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertContains(result.stdout, 'hexpass');
    assertContains(result.stdout, 'Usage');
  });

  // Test 43: --version option
  await test('--version', async () => {
    const result = await runCLI(['--version']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertMatch(result.stdout.trim(), /^\d+\.\d+\.\d+$/, 'Should output version number');
  });

  // Test 44: -v option
  await test('-v option', async () => {
    const result = await runCLI(['-v']);
    assertEqual(result.exitCode, 0, 'Should exit with code 0');
    assertMatch(result.stdout.trim(), /^\d+\.\d+\.\d+$/, 'Should output version number');
  });

  // Test 45: Unknown option
  await test('Unknown option --unknown', async () => {
    const result = await runCLI(['--unknown']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Unknown option');
  });

  // Test 46: Multiple length values
  await test('Multiple length values', async () => {
    const result = await runCLI(['32', '64']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1');
    assertContains(result.stderr, 'Multiple length values provided');
  });

  // Test 47: Complex valid command
  await test('Complex command: --count 1 --env TEST --json', async () => {
    const result = await runCLI(['--count', '1', '--env', 'TEST', '--json']);
    assertEqual(result.exitCode, 1, 'Should exit with code 1 (json incompatible with env)');
  });

  // Print results
  console.log('\n\n');
  console.log('='.repeat(60));
  console.log('Test Results');
  console.log('='.repeat(60));
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Total:  ${passedTests + failedTests}`);

  if (failedTests > 0) {
    console.log('\nFailures:');
    failures.forEach(({ name, error }) => {
      console.log(`  ✗ ${name}`);
      console.log(`    ${error}`);
    });
    process.exit(1);
  } else {
    console.log('\nAll tests passed! ✓');
    process.exit(0);
  }
}

// Run all tests
runTests().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
