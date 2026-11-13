export type UserRole = "admin" | "regular";

export interface User {
  id: string;
  name: string;
  nickname: string;
  email: string;
  role: UserRole;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: User;
  createdAt: string;
}

export type AuthMode = "login" | "register";