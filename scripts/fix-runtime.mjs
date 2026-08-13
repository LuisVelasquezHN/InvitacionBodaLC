import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { globSync } from 'fs';

// Fix runtime to nodejs18.x for Vercel compatibility
const configPath = resolve('.vercel/output/functions/_render.func/.vc-config.json');

try {
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  config.runtime = 'nodejs20.x';
  writeFileSync(configPath, JSON.stringify(config, null, '\t'));
  console.log('✓ Fixed runtime to nodejs18.x');
} catch (e) {
  console.log('⚠ Could not fix runtime:', e.message);
}
