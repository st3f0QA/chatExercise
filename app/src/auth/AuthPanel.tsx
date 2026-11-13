import { useState, type FormEvent } from "react";
import { api } from "../services/api";
import type { AuthMode, User } from "../types";

interface AuthPanelProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function AuthPanel({ mode, onModeChange, onClose, onSuccess }: AuthPanelProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isRegistering = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = isRegistering
        ? await api.register({ name, email, nickname, password })
        : await api.login(email, password);
      onSuccess(user);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()} data-testid="auth-backdrop">
      <section
        className="auth-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        data-testid="auth-dialog"
      >
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close" data-testid="auth-close">×</button>
        <div className="auth-kicker" data-testid="auth-kicker">COMMON ROOM · MEMBER ACCESS</div>
        <h2 id="auth-title" data-testid="auth-title">{isRegistering ? "Make yourself at home." : "Good to have you back."}</h2>
        <p className="auth-description" data-testid="auth-description">
          {isRegistering ? "Create your account and join the conversation." : "Sign in to pick up where the conversation is."}
        </p>
        <form className="auth-form" onSubmit={submit} data-testid="auth-form">
          {isRegistering && (
            <>
              <label className="form-field" data-testid="auth-name-field">
                <span data-testid="auth-name-label">Name</span>
                <input
                  autoComplete="name"
                  minLength={2}
                  maxLength={60}
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  data-testid="auth-name"
                />
              </label>
              <label className="form-field" data-testid="auth-nickname-field">
                <span data-testid="auth-nickname-label">Nickname</span>
                <input
                  autoComplete="nickname"
                  minLength={2}
                  maxLength={24}
                  required
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  data-testid="auth-nickname"
                />
              </label>
            </>
          )}
          <label className="form-field" data-testid="auth-email-field">
            <span data-testid="auth-email-label">Email</span>
            <input
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              data-testid="auth-email"
            />
          </label>
          <label className="form-field" data-testid="auth-password-field">
            <span data-testid="auth-password-label">Password</span>
            <span className="password-control" data-testid="password-control">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={isRegistering ? "new-password" : "current-password"}
                minLength={isRegistering ? 8 : undefined}
                maxLength={128}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                data-testid="auth-password"
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                data-testid="auth-password-toggle"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
          </label>
          {error && <p className="form-error" role="alert" data-testid="auth-error">{error}</p>}
          <button className="auth-submit" type="submit" disabled={submitting} data-testid="auth-submit">
            {submitting ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}
          </button>
        </form>
        <p className="auth-switch-copy" data-testid="auth-switch-copy">
          {isRegistering ? "Already part of the room?" : "New around here?"}
          <button
            className="text-button"
            type="button"
            onClick={() => onModeChange(isRegistering ? "login" : "register")}
            data-testid="auth-mode-toggle"
          >
            {isRegistering ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </div>
  );
}