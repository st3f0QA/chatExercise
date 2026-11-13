import { useEffect, useRef, useState } from "react";
import { AuthPanel } from "./auth/AuthPanel";
import { ChatPage } from "./pages/ChatPage";
import { api } from "./services/api";
import { createChatSocket } from "./services/chatSocket";
import type { AuthMode, ChatMessage, User } from "./types";
import "./styles.css";

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [connected, setConnected] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [appError, setAppError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const socketRef = useRef<ReturnType<typeof createChatSocket> | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.getSession(), api.getMessages()])
      .then(([sessionUser, chatMessages]) => {
        if (!active) return;
        setUser(sessionUser);
        setMessages(chatMessages);
      })
      .catch((error: unknown) => {
        if (active) setAppError(error instanceof Error ? error.message : "Unable to connect to the chat server.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setConnected(false);
    const socket = createChatSocket();
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnected(true);
      setNotice("");
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setNotice("Reconnecting to the room..."));
    socket.on("chat:message", (message: ChatMessage) => {
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
    });
    socket.on("chat:history-cleared", () => {
      setMessages([]);
      setNotice("An admin cleared the chat history.");
    });
    socket.on("chat:error", (message: string) => setNotice(message));
    socket.on("presence:update", (nextUsers: User[]) => setOnlineUsers(nextUsers));
    return () => {
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [user?.id]);

  function sendMessage(content: string) {
    const socket = socketRef.current;
    if (!socket?.connected) {
      setNotice("The room is reconnecting. Please try again in a moment.");
      return;
    }
    setNotice("");
    socket.emit("chat:send", content);
  }

  async function clearHistory() {
    try {
      await api.clearMessages();
      setMessages([]);
      return true;
    } catch (error) {
      setAppError(error instanceof Error ? error.message : "Unable to clear chat history.");
      return false;
    }
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await api.logout();
      setUser(null);
      setAuthMode(null);
      setNotice("You have signed out.");
    } catch (error) {
      setAppError(error instanceof Error ? error.message : "Unable to sign out.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="app-shell" data-testid="app-shell">
      <div className="background-grid" aria-hidden="true" data-testid="background-grid" />
      <header className="app-header" data-testid="app-header">
        <a className="brand-lockup" href="/" aria-label="Common Room home" data-testid="brand-link">
          <span className="brand-mark" aria-hidden="true" data-testid="brand-mark">c.</span>
          <span className="brand-name" data-testid="brand-name">common room</span>
        </a>
        <div className="header-actions" data-testid="header-actions">
          {user ? (
            <>
              <div className="account-chip" data-testid="account-chip">
                <span className="account-avatar" aria-hidden="true" data-testid="account-avatar">
                  {user.nickname.slice(0, 1).toUpperCase()}
                </span>
                <span className="account-copy" data-testid="account-copy">
                  <span className="account-nickname" data-testid="account-nickname">{user.nickname}</span>
                  <span className="account-role" data-testid="account-role">{user.role}</span>
                </span>
              </div>
              <button className="logout-button" type="button" onClick={logout} disabled={loggingOut} data-testid="logout-button">
                {loggingOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <span className="guest-label" data-testid="guest-label">Visiting as a guest</span>
              <button className="header-sign-in" type="button" onClick={() => setAuthMode("login")} data-testid="header-sign-in">
                Sign in
              </button>
              <button className="header-register" type="button" onClick={() => setAuthMode("register")} data-testid="header-register">
                Create account
              </button>
            </>
          )}
        </div>
      </header>

      <div className="page-intro" data-testid="page-intro">
        <span className="eyebrow" data-testid="page-eyebrow">A PLACE TO CATCH UP</span>
        <p data-testid="page-intro-copy">A good conversation is always in season.</p>
      </div>

      {appError && <p className="app-error" role="alert" data-testid="app-error">{appError}</p>}
      {loading ? (
        <div className="loading-state" role="status" data-testid="loading-state">Opening the room...</div>
      ) : (
        <ChatPage
          user={user}
          messages={messages}
          onlineUsers={onlineUsers}
          connected={connected}
          notice={notice}
          onSend={sendMessage}
          onClearHistory={clearHistory}
          onOpenAuth={setAuthMode}
        />
      )}

      <footer className="app-footer" data-testid="app-footer">
        <span data-testid="footer-note">A quiet little corner of your local internet.</span>
        <span className="footer-status" data-testid="footer-status">
          <span className={`footer-status-dot${connected ? " footer-status-dot-live" : ""}`} aria-hidden="true" data-testid="footer-status-dot" />
          {connected ? "Connected" : "Connecting"}
        </span>
      </footer>

      {authMode && (
        <AuthPanel
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthMode(null)}
          onSuccess={(authenticatedUser) => {
            setUser(authenticatedUser);
            setAuthMode(null);
            setNotice("");
          }}
        />
      )}
    </div>
  );
}