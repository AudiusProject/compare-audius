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
// This regex matches the pattern and replaces it with the actual package name
// Pattern: @libsql/client- followed by a hex hash (typically 16 characters)
const externalModulePattern = /@libsql\/client-[a-f0-9]{16}/g;
const matches = [...new Set(workerContent.match(externalModulePattern) || [])];

if (matches && matches.length > 0) {
  console.log(`Found ${matches.length} unique external module reference(s) to fix:`);
  matches.forEach(match => {
    console.log(`  - Replacing: ${match} -> @libsql/client`);
  });
  
  // Replace all occurrences
  workerContent = workerContent.replace(externalModulePattern, '@libsql/client');
  
  // Also try to replace in string contexts (quoted strings)
  workerContent = workerContent.replace(/"@libsql\/client-[a-f0-9]{16}"/g, '"@libsql/client"');
  workerContent = workerContent.replace(/'@libsql\/client-[a-f0-9]{16}'/g, "'@libsql/client'");
  
  // Write the patched file only if changes were made
  if (workerContent !== originalContent) {
    fs.writeFileSync(workerPath, workerContent, 'utf8');
    console.log('✓ Successfully patched _worker.js');
  } else {
    console.log('⚠ No changes made (pattern might have changed)');
  }
} else {
  console.log('ℹ No external module references found to patch');
  console.log('  (This might mean the module is already bundled or the pattern changed)');
}

