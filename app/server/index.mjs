import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import express from "express";
import session from "express-session";
import { Server } from "socket.io";
import { AuthService, toPublicUser } from "./auth-service.mjs";
import { hashPassword } from "./passwords.mjs";
import { UserRepository } from "./user-repository.mjs";

const port = Number(process.env.PORT ?? 3001);
const sessionLifetime = 8 * 60 * 60 * 1000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const sessionMiddleware = session({
  name: "common-room.sid",
  secret: process.env.SESSION_SECRET ?? "local-development-secret-change-before-deploying",
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: sessionLifetime }
});
const activeUsers = new Map();
const publicDirectory = resolve("dist");

app.use(express.json({ limit: "16kb" }));
app.use(sessionMiddleware);

function sendError(response, status, message) {
  response.status(status).json({ error: message });
}

function saveSession(request) {
  return new Promise((resolveSave, rejectSave) => {
    request.session.save((error) => error ? rejectSave(error) : resolveSave());
  });
}

function regenerateSession(request) {
  return new Promise((resolveSession, rejectSession) => {
    request.session.regenerate((error) => error ? rejectSession(error) : resolveSession());
  });
}

function destroySession(request) {
  return new Promise((resolveDestroy, rejectDestroy) => {
    request.session.destroy((error) => error ? rejectDestroy(error) : resolveDestroy());
  });
}

function onlineUserList() {
  return [...activeUsers.values()].map(({ user }) => toPublicUser(user));
}

app.get("/api/health", (_request, response) => response.json({ status: "ok" }));

app.get("/api/auth/session", (request, response) => {
  const user = request.session.userId ? userRepository.findUserById(request.session.userId) : null;
  response.json({ user: user ? toPublicUser(user) : null });
});

app.post("/api/auth/register", async (request, response) => {
  try {
    const user = await authService.register(request.body ?? {});
    await regenerateSession(request);
    request.session.userId = user.id;
    await saveSession(request);
    response.status(201).json({ user: toPublicUser(user) });
  } catch (error) {
    sendError(response, 400, error.message || "Unable to create the account.");
  }
});

app.post("/api/auth/login", async (request, response) => {
  const { email, password } = request.body ?? {};
  const user = await authService.authenticate(email, password);
  if (!user) return sendError(response, 401, "Email or password is incorrect.");

  try {
    await regenerateSession(request);
    request.session.userId = user.id;
    await saveSession(request);
    response.json({ user: toPublicUser(user) });
  } catch {
    sendError(response, 500, "Unable to start a session. Please try again.");
  }
});

app.post("/api/auth/logout", async (request, response) => {
  const userId = request.session.userId;
  try {
    await destroySession(request);
    response.clearCookie("common-room.sid", { httpOnly: true, sameSite: "lax", secure: false });
    if (userId) io.in(`user:${userId}`).disconnectSockets(true);
    response.status(204).end();
  } catch {
    sendError(response, 500, "Unable to end the session. Please try again.");
  }
});

app.get("/api/messages", (_request, response) => response.json({ messages: userRepository.listMessages() }));

app.delete("/api/messages", async (request, response) => {
  const user = request.session.userId ? userRepository.findUserById(request.session.userId) : null;
  if (user?.role !== "admin") return sendError(response, 403, "Administrator access is required.");

  try {
    await userRepository.clearMessages();
    io.emit("chat:history-cleared");
    response.status(204).end();
  } catch {
    sendError(response, 500, "Chat history could not be cleared. Please try again.");
  }
});

if (existsSync(publicDirectory)) {
  app.use(express.static(publicDirectory));
  app.get("*path", (_request, response) => response.sendFile(resolve(publicDirectory, "index.html")));
}

io.engine.use(sessionMiddleware);
io.use((socket, next) => {
  const userId = socket.request.session?.userId;
  socket.data.user = userId ? userRepository.findUserById(userId) : null;
  next();
});

io.on("connection", (socket) => {
  const user = socket.data.user;
  if (user) {
    const active = activeUsers.get(user.id) ?? { user, connections: 0 };
    active.connections += 1;
    activeUsers.set(user.id, active);
    socket.join(`user:${user.id}`);
  }

  socket.emit("presence:update", onlineUserList());
  if (user) io.emit("presence:update", onlineUserList());

  socket.on("chat:send", async (rawContent) => {
    const expiresAt = socket.request.session?.cookie?.expires;
    const sessionIsExpired = expiresAt && new Date(expiresAt).getTime() <= Date.now();
    if (!user || !socket.request.session?.userId || sessionIsExpired) {
      socket.emit("chat:error", "Please sign in or register to send messages.");
      return;
    }

    const content = typeof rawContent === "string" ? rawContent.trim() : "";
    if (!content || content.length > 500) {
      socket.emit("chat:error", "Messages must be between 1 and 500 characters.");
      return;
    }

    const message = {
      id: randomUUID(),
      content,
      sender: toPublicUser(user),
      createdAt: new Date().toISOString()
    };
    try {
      await userRepository.addMessage(message);
      io.emit("chat:message", message);
    } catch {
      socket.emit("chat:error", "Message could not be saved. Please try again.");
    }
  });

  socket.on("disconnect", () => {
    if (!user) return;
    const active = activeUsers.get(user.id);
    if (!active) return;
    if (active.connections > 1) active.connections -= 1;
    else activeUsers.delete(user.id);
    io.emit("presence:update", onlineUserList());
  });
});

await userRepository.initialize();
await userRepository.seedAdmin(await hashPassword(process.env.ADMIN_PASSWORD ?? "Admin123!"));

httpServer.listen(port, "127.0.0.1", () => {
  console.log(`Chat server ready at http://127.0.0.1:${port}`);
});