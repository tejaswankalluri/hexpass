#!/usr/bin/env node

const { run } = require("../src/cli");

run(process.argv.slice(2), process.stdout, process.stderr, process.exit);
