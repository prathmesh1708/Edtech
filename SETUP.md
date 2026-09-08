# Setup

## Why the backend "loses its files"

`npm install` does not delete anything in this project. What actually goes
missing is `edtech-backend/.env`.

That file is git-ignored on purpose (it holds your MongoDB URI and JWT secret),
which means it is **not** in the repository. So it does not come back from:

- `git clone`
- `git pull`
- `git reset --hard` / "Discard all changes" in VS Code
- copying the project to another machine

Because `npm install` is usually the first thing you run after a fresh clone,
it looks like `npm install` deleted the backend. It didn't — the file was
never there in that copy.

`npm run dev` in the backend now checks for this and tells you exactly what
is missing instead of starting a server where every request silently fails.

## Keep your .env safe

Store a copy of your real `edtech-backend/.env` somewhere **outside** this
folder — a password manager or a note. Never commit it.

## Running the project

Backend:

    cd edtech-backend
    npm install
    cp .env.example .env     # then fill in MONGO_URI and JWT_SECRET
    npm run dev              # http://localhost:5001

Frontend:

    cd edtech-frontend
    npm install
    npm run dev              # http://localhost:5173

The frontend falls back to `http://localhost:5001/api` when
`edtech-frontend/.env` is absent, so it works without one locally. Set
`VITE_API_URL` when pointing at a deployed backend.

## Note on the repo root

The root `package.json` / `package-lock.json` exist only for Vercel. Running
`npm install` at the root installs nothing — always `cd` into
`edtech-backend` or `edtech-frontend` first.
