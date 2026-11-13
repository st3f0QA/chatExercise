import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dataFile = join(dirname(fileURLToPath(import.meta.url)), "data", "chat-data.json");

export class UserRepository {
  constructor() {
    this.users = [];
    this.messages = [];
    this.writeQueue = Promise.resolve();
  }

  async initialize() {
    try {
      const saved = JSON.parse(await readFile(dataFile, "utf8"));
      this.users = saved.users ?? [];
      this.messages = saved.messages ?? [];
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      await this.persist();
    }
  }

  async seedAdmin(passwordHash) {
    if (this.users.some((user) => user.role === "admin")) return;
    await this.createUser({
      id: "local-admin",
      name: "Avery Admin",
      email: "admin@localhost.test",
      nickname: "Avery",
      passwordHash,
      role: "admin",
      createdAt: new Date().toISOString()
    });
  }

  findUserByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();
    return this.users.find((user) => user.email === normalizedEmail) ?? null;
  }

  findUserById(id) {
    return this.users.find((user) => user.id === id) ?? null;
  }

  hasNickname(nickname) {
    const normalizedNickname = nickname.trim().toLowerCase();
    return this.users.some((user) => user.nickname.toLowerCase() === normalizedNickname);
  }

  async createUser(user) {
    if (this.findUserByEmail(user.email)) throw new Error("An account with that email already exists.");
    if (this.hasNickname(user.nickname)) throw new Error("That nickname is already in use.");
    this.users.push(user);
    await this.persist();
    return user;
  }

  async addMessage(message) {
    this.messages.push(message);
    this.messages = this.messages.slice(-500);
    await this.persist();
    return message;
  }

  listMessages() {
    return this.messages.slice(-100);
  }

  async clearMessages() {
    this.messages = [];
    await this.persist();
  }

  async persist() {
    const snapshot = JSON.stringify({ users: this.users, messages: this.messages }, null, 2);
    const temporaryFile = `${dataFile}.tmp`;
    const write = this.writeQueue.then(async () => {
      await mkdir(dirname(dataFile), { recursive: true });
      await writeFile(temporaryFile, snapshot, "utf8");
      await rename(temporaryFile, dataFile);
    });
    this.writeQueue = write.catch(() => {});
    return write;
  }
}