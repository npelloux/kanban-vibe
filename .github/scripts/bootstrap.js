#!/usr/bin/env node
// bootstrap.js — synchronise le kernel SDEG vers le projet consommateur.
// Exécuter depuis la racine du projet : node .sdeg/scripts/bootstrap.js
//
// Source de vérité : le submodule `.sdeg/`.
// Idempotent : relancer après chaque `git submodule update --remote`.

const fs = require('node:fs');
const path = require('node:path');

const kernelRoot = path.resolve(__dirname, '..');
const projectRoot = process.cwd();

if (path.resolve(projectRoot) === path.resolve(kernelRoot)) {
  console.error('❌ Lancer bootstrap depuis la racine du projet consommateur, pas depuis le kernel.');
  process.exit(1);
}

function copyTree(src, dest, label) {
  if (!fs.existsSync(src)) {
    console.warn(`  ⚠ Source absente : ${src}`);
    return 0;
  }
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
  const count = countFiles(dest);
  console.log(`  ✓ ${label} (${count} fichiers)`);
  return count;
}

function countFiles(dir) {
  let n = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) n += countFiles(full);
    else n += 1;
  }
  return n;
}

console.log('');
console.log('Synchronisation kernel SDEG...');
console.log(`  Source : ${path.relative(projectRoot, kernelRoot) || '.'}`);
console.log('');

copyTree(
  path.join(kernelRoot, '.github', 'prompts'),
  path.join(projectRoot, '.github', 'prompts'),
  'Skills (prompts)'
);
copyTree(
  path.join(kernelRoot, '.github', 'agents'),
  path.join(projectRoot, '.github', 'agents'),
  'Agents'
);
copyTree(
  path.join(kernelRoot, 'scripts'),
  path.join(projectRoot, '.github', 'scripts'),
  'Hooks (scripts)'
);
copyTree(
  path.join(kernelRoot, 'meta'),
  path.join(projectRoot, '.meta'),
  'Templates'
);

console.log('');
console.log('Kernel synchronisé. Pour activer le hook git pre-commit :');
console.log('  node .sdeg/sdlc/install-hooks.js');
console.log('');
