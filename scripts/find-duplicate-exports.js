import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Store all exports
const exports = new Map(); // key: exported name, value: array of files exporting it

function parseExports(content, filePath) {
  // Match export statements like: export { default as Name } from './file'
  const exportMatches = content.matchAll(/export\s*{\s*(?:default\s+as\s+)?([^}\s]+)\s*}[^;]*;/g);
  
  for (const match of exportMatches) {
    const name = match[1].trim();
    if (!exports.has(name)) {
      exports.set(name, new Set());
    }
    exports.get(name).add(filePath);
  }
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'coverage', 'czkawka'].includes(entry.name)) {
        scanDirectory(fullPath);
      }
      continue;
    }

    if (entry.name === 'index.ts' || entry.name === 'index.js') {
      const content = fs.readFileSync(fullPath, 'utf8');
      parseExports(content, path.relative(rootDir, fullPath));
    }
  }
}

console.log('Scanning for duplicate exports...');
scanDirectory(rootDir);

// Print results
const duplicates = Array.from(exports.entries())
  .filter(([_, files]) => files.size > 1);

if (duplicates.length === 0) {
  console.log('No duplicate exports found!');
} else {
  console.log('\nFound duplicate exports:');
  duplicates.forEach(([name, files]) => {
    console.log(`\n'${name}' is exported in:`);
    files.forEach(file => console.log(`  ${file}`));
  });
}
