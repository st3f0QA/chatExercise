import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "./passwords.mjs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    email: user.email,
    role: user.role
  };
}

export class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register({ name, email, password, nickname }) {
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanNickname = typeof nickname === "string" ? nickname.trim() : "";

    if (cleanName.length < 2 || cleanName.length > 60) throw new Error("Name must be between 2 and 60 characters.");
    if (!emailPattern.test(cleanEmail) || cleanEmail.length > 254) throw new Error("Enter a valid email address.");
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      throw new Error("Password must be between 8 and 128 characters.");
    }
    if (cleanNickname.length < 2 || cleanNickname.length > 24) {
      throw new Error("Nickname must be between 2 and 24 characters.");
    }
    if (this.userRepository.findUserByEmail(cleanEmail)) throw new Error("An account with that email already exists.");
    if (this.userRepository.hasNickname(cleanNickname)) throw new Error("That nickname is already in use.");

    const user = {
      id: randomUUID(),
      name: cleanName,
      email: cleanEmail,
      nickname: cleanNickname,
      passwordHash: await hashPassword(password),
      role: "regular",
      createdAt: new Date().toISOString()
    };
    return this.userRepository.createUser(user);
  }

  async authenticate(email, password) {
    if (typeof email !== "string" || typeof password !== "string") return null;
    const user = this.userRepository.findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) return null;
    return user;
  }
}