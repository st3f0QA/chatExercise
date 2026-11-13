import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";

interface MessageComposerProps {
  connected: boolean;
  onSend: (content: string) => void;
}

const emojiOptions = [
  { id: "smile", value: "😊" },
  { id: "heart", value: "💛" },
  { id: "wave", value: "👋" },
  { id: "sparkles", value: "✨" },
  { id: "thumbs-up", value: "👍" }
];

export function MessageComposer({ connected, onSend }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanContent = content.trim();
    if (!cleanContent || !connected) return;
    onSend(cleanContent);
    setContent("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form className="composer" onSubmit={submitMessage} data-testid="message-composer">
      <label className="visually-hidden" htmlFor="message-input" data-testid="message-input-label">Write a message</label>
      <textarea
        id="message-input"
        ref={inputRef}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={500}
        placeholder={connected ? "Write something kind..." : "Reconnecting to the room..."}
        disabled={!connected}
        rows={2}
        data-testid="message-input"
      />
      <div className="composer-tools" data-testid="composer-tools">
        <div className="emoji-tools" aria-label="Add an emoji" data-testid="emoji-tools">
          {emojiOptions.map(({ id, value }) => (
            <button
              className="emoji-button"
              key={id}
              type="button"
              aria-label={`Add ${id.replace("-", " ")} emoji`}
              title={`Add ${value}`}
              disabled={!connected}
              onClick={() => {
                setContent((current) => `${current}${value}`);
                inputRef.current?.focus();
              }}
              data-testid={`emoji-${id}`}
            >
              {value}
            </button>
          ))}
        </div>
        <span className="composer-shortcut" data-testid="composer-shortcut">Enter to send</span>
        <button
          className="send-button"
          type="submit"
          disabled={!content.trim() || !connected}
          aria-label="Send message"
          data-testid="send-message"
        >
          <span data-testid="send-message-icon" aria-hidden="true">↗</span>
        </button>
      </div>
    </form>
  );
}