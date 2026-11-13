import { useEffect, useRef } from "react";
import type { ChatMessage, User } from "../types";

interface MessageListProps {
  messages: ChatMessage[];
  currentUser: User | null;
}

export function MessageList({ messages, currentUser }: MessageListProps) {
  const endOfListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfListRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="empty-messages" data-testid="empty-messages">
        <span className="empty-mark" aria-hidden="true">✳</span>
        <p data-testid="empty-messages-copy">A little quiet in here.</p>
        <span data-testid="empty-messages-hint">Start the conversation when you are ready.</span>
      </div>
    );
  }

  return (
    <ol className="message-list" aria-label="Chat messages" data-testid="message-list">
      {messages.map((message) => {
        const isOwnMessage = message.sender.id === currentUser?.id;
        return (
          <li
            className={`message-row${isOwnMessage ? " message-row-own" : ""}`}
            key={message.id}
            data-testid={`message-${message.id}`}
          >
            <div className="message-avatar" aria-hidden="true" data-testid={`message-avatar-${message.id}`}>
              {message.sender.nickname.slice(0, 1).toUpperCase()}
            </div>
            <div className="message-body" data-testid={`message-body-${message.id}`}>
              <div className="message-meta" data-testid={`message-meta-${message.id}`}>
                <span className="message-author" data-testid={`message-author-${message.id}`}>
                  {message.sender.nickname}
                </span>
                {message.sender.role === "admin" && (
                  <span className="message-role" data-testid={`message-role-${message.id}`}>Admin</span>
                )}
                <time dateTime={message.createdAt} data-testid={`message-time-${message.id}`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </time>
              </div>
              <p className="message-content" data-testid={`message-content-${message.id}`}>{message.content}</p>
            </div>
          </li>
        );
      })}
      <div ref={endOfListRef} data-testid="message-list-end" />
    </ol>
  );
}