import type { ChatMessage, User } from "../types";

interface ApiResponse<T> {
  data: T;
}

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    }
  });

  if (response.status === 204) return { data: undefined as T };
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "The request could not be completed.");
  return { data: body as T };
}

export const api = {
  async getSession() {
    const { data } = await request<{ user: User | null }>("/api/auth/session");
    return data.user;
  },
  async getMessages() {
    const { data } = await request<{ messages: ChatMessage[] }>("/api/messages");
    return data.messages;
  },
  async clearMessages() {
    await request<void>("/api/messages", { method: "DELETE" });
  },
  async login(email: string, password: string) {
    const { data } = await request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    return data.user;
  },
  async register(values: { name: string; email: string; nickname: string; password: string }) {
    const { data } = await request<{ user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(values)
    });
    return data.user;
  },
  async logout() {
    await request<void>("/api/auth/logout", { method: "POST" });
  }
};