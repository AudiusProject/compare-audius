#!/usr/bin/env node

/**
 * Post-build script to patch OpenNext Cloudflare worker.js
 * Fixes external module references for @libsql/client
 * 
 * OpenNext externalizes @libsql/client with a hash (e.g., @libsql/client-6da938047d5fc1cd),
 * but Cloudflare Workers can't resolve these external modules. This script replaces
 * the hashed external references with the actual package name.
 */

const fs = require('fs');
const path = require('path');

const workerPath = path.join(__dirname, '..', '.open-next', '_worker.js');

if (!fs.existsSync(workerPath)) {
  console.error('Error: _worker.js not found at', workerPath);
  process.exit(1);
}

console.log('Patching _worker.js to fix @libsql/client external module references...');

let workerContent = fs.readFileSync(workerPath, 'utf8');
const originalContent = workerContent;

// Replace external module references like @libsql/client-6da938047d5fc1cd with @libsql/client
// Try multiple patterns to catch different formats (minified, quoted, etc.)
const patterns = [
  // Standard pattern: @libsql/client-{hash}
  /@libsql\/client-[a-f0-9]{16}/g,
  // In quotes
  /"@libsql\/client-[a-f0-9]{16}"/g,
  /'@libsql\/client-[a-f0-9]{16}'/g,
  // With escaped slashes (in strings)
  /"@libsql\\\/client-[a-f0-9]{16}"/g,
  /'@libsql\\\/client-[a-f0-9]{16}'/g,
  // Minified/obfuscated patterns
  /@libsql\\u002fclient-[a-f0-9]{16}/g,
];

let totalReplacements = 0;
patterns.forEach((pattern, index) => {
  const matches = workerContent.match(pattern);
  if (matches) {
    const uniqueMatches = [...new Set(matches)];
    console.log(`Pattern ${index + 1}: Found ${uniqueMatches.length} match(es)`);
    uniqueMatches.forEach(match => {
      const replacement = match.replace(/@libsql[\/\\u002f]client-[a-f0-9]{16}/, '@libsql/client');
      console.log(`  - Replacing: ${match.substring(0, 50)}... -> @libsql/client`);
      workerContent = workerContent.replace(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
      totalReplacements++;
    });
  }
});

if (totalReplacements > 0) {
  fs.writeFileSync(workerPath, workerContent, 'utf8');
  console.log(`✓ Successfully patched _worker.js (${totalReplacements} replacement(s))`);
} else {
  console.log('ℹ No external module references found to patch');
  console.log('  (This might mean the module is already bundled or the pattern changed)');
  // Try a more aggressive search
  if (workerContent.includes('libsql') && workerContent.includes('client')) {
    console.log('  ⚠ Found "libsql" and "client" in file, but pattern didn\'t match');
    console.log('  This might indicate a different externalization format');
  }
}

