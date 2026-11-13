import { io } from "socket.io-client";

export function createChatSocket() {
  return io({ autoConnect: true, withCredentials: true });
}