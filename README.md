# Common Room

A small localhost chat app with guest read-only access, regular member accounts, a seeded admin, emoji messages, and live delivery through Socket.IO. Admins can clear chat history for everyone from the room controls.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Open <http://127.0.0.1:5173>. The API and Socket.IO server run on port `3001` behind the Vite development proxy.

The first run seeds this local admin account:

- Email: `admin@localhost.test`
- Password: `Admin123!`

Set `ADMIN_PASSWORD` before the first run to choose a different seed password. The seed is created once and stored in `app/server/data/chat-data.json`.

## Checks

```sh
npm run build
npm run test:e2e
```

Playwright starts the app automatically for end-to-end tests. Tests use page objects in `e2e/pages`, shared fixtures in `e2e/fixtures`, and stable `data-testid` selectors.

## Local prototype notes

User accounts and chat history are stored in a local JSON file; passwords are scrypt-hashed. Sessions use an HTTP-only, same-site cookie with an eight-hour rolling lifetime. The default Express session store is in-memory, so sessions end when the server restarts.

This setup is intended for a single local development server, not production or multi-instance deployment. Replace the demo admin password and session secret, use a durable database/session store, and add production-grade abuse protections before exposing it beyond localhost.