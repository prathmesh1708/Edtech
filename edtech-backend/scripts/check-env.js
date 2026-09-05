// Runs before `npm run dev` / `npm start`.
// The .env file is git-ignored, so it does NOT survive a fresh clone, a hard
// reset, or moving to another machine. Without it the server still boots but
// every DB query and every login silently fails, which looks like missing code.
// This check turns that silent failure into a loud, actionable one.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env');
const examplePath = path.join(root, '.env.example');

const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];

if (!fs.existsSync(envPath)) {
  fs.copyFileSync(examplePath, envPath);
  console.error(`
==================================================================
  edtech-backend/.env was missing and has been recreated from
  .env.example with PLACEHOLDER values.

  Open edtech-backend/.env and fill in your real values:
    ${REQUIRED.join(', ')}

  Then run this command again.

  Note: .env is git-ignored on purpose (it holds secrets), so it is
  never restored by "git clone" or "git pull". Keep a backup copy
  somewhere outside this repo.
==================================================================
`);
  process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8');
const missing = REQUIRED.filter((key) => {
  const match = env.match(new RegExp(`^\\s*${key}\\s*=\\s*(.*)$`, 'm'));
  const value = match?.[1]?.trim();
  return !value || value.includes('<') || value.includes('change_me');
});

if (missing.length) {
  console.error(`
==================================================================
  edtech-backend/.env exists but these values are missing or are
  still placeholders:

    ${missing.join('\n    ')}

  Fill them in (see .env.example) and run this command again.
==================================================================
`);
  process.exit(1);
}
