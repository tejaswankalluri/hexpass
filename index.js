const { run } = require("./src/cli");

if (require.main === module) {
  run(process.argv.slice(2), process.stdout, process.stderr, process.exit);
}

module.exports = { run };
