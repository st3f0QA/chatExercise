# Architecture

## Runtime

- `app/src` contains the React client, split into page-level composition, focused UI components, auth UI, and API/socket services.
- `app/server/index.mjs` owns HTTP routes, the shared cookie session middleware, Socket.IO wiring, and server startup.
- `app/server/auth-service.mjs` validates registration and authenticates users. `passwords.mjs` hashes and verifies passwords with Node's scrypt implementation.
- `app/server/user-repository.mjs` persists users and the latest 500 messages to `app/server/data/chat-data.json` using an atomic file replacement.
- `e2e/pages` contains Playwright page objects; tests interact through those objects and explicit `data-testid` selectors.

## Authentication and roles

Registration always creates a `regular` account. The first server start seeds one `admin` account. A visitor without a session is a `guest`: guests can read the room and online presence but have no message input. The server derives every sender from the authenticated session; the client cannot choose a sender name or role. Only admins may delete message history; deletion is persisted and broadcast to all connected clients.

The HTTP-only, same-site session cookie has an eight-hour rolling lifetime. Logging out destroys the session and disconnects that user's active sockets. The shared session is also checked for expiry before accepting a socket message.

## Realtime flow

The browser sends message content only. The server validates length, attaches the session user's public profile, persists the message, then broadcasts it to all connected clients. Socket.IO shares the HTTP session middleware, so UI restrictions are backed by server-side authorization.

## Scope

JSON persistence and Express's default in-memory session store keep this project dependency-light for localhost. They are single-process development choices: concurrent server instances, production availability, and durable session recovery require a real database and shared session store.
