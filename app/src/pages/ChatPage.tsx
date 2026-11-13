import { useState } from "react";
import { MessageComposer } from "../components/MessageComposer";
import { MessageList } from "../components/MessageList";
import type { ChatMessage, User } from "../types";

interface ChatPageProps {
  user: User | null;
  messages: ChatMessage[];
  onlineUsers: User[];
  connected: boolean;
  notice: string;
  onSend: (content: string) => void;
  onClearHistory: () => Promise<boolean>;
  onOpenAuth: (mode: "login" | "register") => void;
}

export function ChatPage({
  user,
  messages,
  onlineUsers,
  connected,
  notice,
  onSend,
  onClearHistory,
  onOpenAuth
}: ChatPageProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function confirmClearHistory() {
    setClearing(true);
    const cleared = await onClearHistory();
    setClearing(false);
    if (cleared) setConfirmingClear(false);
  }

  return (
    <main className="chat-workspace" data-testid="chat-workspace">
      <aside className="people-panel" aria-label="People in the room" data-testid="people-panel">
        <div className="people-heading" data-testid="people-heading">
          <div>
            <span className="section-label" data-testid="people-section-label">AROUND THE TABLE</span>
            <h2 data-testid="people-title">People here</h2>
          </div>
          <span className="people-count" data-testid="people-count">{onlineUsers.length}</span>
        </div>
        <div className="presence-summary" data-testid="presence-summary">
          <span className={`presence-dot${connected ? " presence-dot-live" : ""}`} aria-hidden="true" data-testid="presence-indicator" />
          <span data-testid="presence-copy">{connected ? "Room is live" : "Connecting to room"}</span>
        </div>
        {onlineUsers.length > 0 ? (
          <ul className="people-list" aria-label="Online members" data-testid="people-list">
            {onlineUsers.map((person) => (
              <li className="person-row" key={person.id} data-testid={`online-user-${person.id}`}>
                <span className="person-avatar" aria-hidden="true" data-testid={`online-avatar-${person.id}`}>
                  {person.nickname.slice(0, 1).toUpperCase()}
                </span>
                <span className="person-copy" data-testid={`online-copy-${person.id}`}>
                  <span className="person-name" data-testid={`online-name-${person.id}`}>{person.nickname}</span>
                  <span className="person-role" data-testid={`online-role-${person.id}`}>
                    {person.id === user?.id ? "You" : person.role === "admin" ? "Room host" : "Member"}
                  </span>
                </span>
                <span className="person-online-dot" aria-label="Online" data-testid={`online-status-${person.id}`} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="people-empty" data-testid="people-empty">No members are here just yet.</p>
        )}
        <div className="room-note" data-testid="room-note">
          <span className="room-note-mark" aria-hidden="true" data-testid="room-note-mark">✳</span>
          <p data-testid="room-note-copy">A small corner of the internet for good conversation.</p>
        </div>
      </aside>

      <section className="conversation-panel" aria-label="Common room chat" data-testid="conversation-panel">
        <header className="conversation-heading" data-testid="conversation-heading">
          <div className="conversation-title-wrap" data-testid="conversation-title-wrap">
            <span className="channel-mark" aria-hidden="true" data-testid="channel-mark">#</span>
            <div>
              <h1 data-testid="conversation-title">The common room</h1>
              <p data-testid="conversation-subtitle">Good things happen when we talk.</p>
            </div>
          </div>
          <div className="conversation-actions" data-testid="conversation-actions">
            {user?.role === "admin" && (
              <button
                className="clear-history-button"
                type="button"
                onClick={() => setConfirmingClear(true)}
                data-testid="clear-history-button"
              >
                Clear history
              </button>
            )}
            <span className="connection-label" data-testid="connection-label">
              <span className={`connection-dot${connected ? " connection-dot-live" : ""}`} aria-hidden="true" data-testid="connection-dot" />
              {connected ? "Live" : "Connecting"}
            </span>
          </div>
        </header>

        <div className="message-scroll" data-testid="message-scroll">
          <MessageList messages={messages} currentUser={user} />
        </div>

        {notice && <p className="chat-notice" role="status" data-testid="chat-notice">{notice}</p>}

        {user ? (
          <MessageComposer connected={connected} onSend={onSend} />
        ) : (
          <div className="guest-prompt" data-testid="guest-prompt">
            <div className="guest-prompt-copy" data-testid="guest-prompt-copy">
              <span className="guest-lock" aria-hidden="true" data-testid="guest-lock">↳</span>
              <span data-testid="guest-prompt-text">Enjoying the conversation? Join in with an account.</span>
            </div>
            <div className="guest-prompt-actions" data-testid="guest-prompt-actions">
              <button className="guest-sign-in" type="button" onClick={() => onOpenAuth("login")} data-testid="guest-sign-in">
                Sign in
              </button>
              <button className="guest-register" type="button" onClick={() => onOpenAuth("register")} data-testid="guest-register">
                Join the room <span aria-hidden="true" data-testid="guest-register-icon">↗</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {confirmingClear && (
        <div
          className="clear-history-backdrop"
          onMouseDown={(event) => event.target === event.currentTarget && !clearing && setConfirmingClear(false)}
          data-testid="clear-history-backdrop"
        >
          <section
            className="clear-history-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-history-title"
            data-testid="clear-history-dialog"
          >
            <span className="clear-history-kicker" data-testid="clear-history-kicker">ROOM ADMIN</span>
            <h2 id="clear-history-title" data-testid="clear-history-title">Start with a clean slate?</h2>
            <p data-testid="clear-history-description">This removes every message from the room for everyone. Accounts will not be affected.</p>
            <div className="clear-history-actions" data-testid="clear-history-actions">
              <button
                className="cancel-clear-button"
                type="button"
                disabled={clearing}
                onClick={() => setConfirmingClear(false)}
                data-testid="cancel-clear-history"
              >
                Keep history
              </button>
              <button
                className="confirm-clear-button"
                type="button"
                disabled={clearing}
                onClick={confirmClearHistory}
                data-testid="confirm-clear-history"
              >
                {clearing ? "Clearing..." : "Clear all messages"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}