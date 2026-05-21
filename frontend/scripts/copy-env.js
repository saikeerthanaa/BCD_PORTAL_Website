const fs = require('fs');
const path = require('path');

const source = path.resolve(__dirname, '..', '..', '.env');
const target = path.resolve(__dirname, '..', '.env');

try {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target);
    console.log(`Copied ${source} -> ${target}`);
  } else {
    console.log(`No root .env found at ${source}; skipping copy.`);
  }
} catch (error) {
  console.error('Failed to copy .env:', error.message);
  process.exit(1);
}
