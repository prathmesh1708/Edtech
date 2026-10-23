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
  // [ \t]* rather than \s*: \s also matches newlines, so an empty value would read the next line.
  const match = env.match(new RegExp(`^[ \\t]*${key}[ \\t]*=[ \\t]*(.*)$`, 'm'));
  const value = match?.[1]?.trim();
  return !value || value.includes('<') || value.includes('change_me');
});

// Optional features: the server still starts, but say clearly what is switched off.
const gemini = env.match(/^[ \t]*GEMINI_API_KEY[ \t]*=[ \t]*(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '');
if (!gemini && !missing.length) {
  console.warn(`
------------------------------------------------------------------
  GEMINI_API_KEY is not set in edtech-backend/.env, so the AI tutor
  (AI Chat, Practice Quiz) is OFF. Students will see "The AI tutor is
  not available right now."

  Get a key at https://aistudio.google.com/apikey, paste it after
  GEMINI_API_KEY= in edtech-backend/.env, and restart the backend.
------------------------------------------------------------------
`);
}

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
