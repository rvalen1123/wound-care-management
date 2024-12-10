import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Directories to ignore
const ignoreDirs = new Set([
  'node_modules',
  '.git',
  'dist',
  'coverage',
  'czkawka'
]);

// File extensions to check
const checkExtensions = new Set([
  '.js',
  '.ts',
  '.vue',
  '.json'
]);

// Store file hashes
const fileHashes = new Map();
const duplicates = new Map();

function calculateFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) {
        scanDirectory(fullPath);
      }
      continue;
    }

    const ext = path.extname(entry.name);
    if (!checkExtensions.has(ext)) {
      continue;
    }

    const hash = calculateFileHash(fullPath);
    
    if (fileHashes.has(hash)) {
      const existingPath = fileHashes.get(hash);
      if (!duplicates.has(hash)) {
        duplicates.set(hash, [existingPath]);
      }
      duplicates.get(hash).push(fullPath);
    } else {
      fileHashes.set(hash, fullPath);
    }
  }
}

// Start scan from root directory
console.log('Scanning for duplicates...');
scanDirectory(rootDir);

// Print results
if (duplicates.size === 0) {
  console.log('No duplicates found!');
} else {
  console.log('\nFound duplicates:');
  duplicates.forEach((paths, hash) => {
    console.log('\nDuplicate files (hash: ' + hash + '):');
    paths.forEach(p => console.log('  ' + path.relative(rootDir, p)));
  });
}
