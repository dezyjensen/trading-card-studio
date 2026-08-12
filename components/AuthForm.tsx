"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fetchMe, loginAccount, registerAccount } from "@/lib/api/client";
import { APP_SLOGAN } from "@/lib/brand";
import { notifyUserChanged } from "@/lib/saves";

export type AuthMode = "login" | "register";

const field =
  "min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-3.5 py-3 text-base text-[var(--ink)] outline-none transition focus:border-[var(--brass)]";
const label = "block text-sm font-medium text-[var(--ink-muted)]";

type AuthFormProps = {
  initialMode?: AuthMode;
};

export function AuthForm({ initialMode = "login" }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const nextPath = useMemo(() => {
    const raw = searchParams.get("next") || "/#studio";
    // Only allow same-origin relative paths
    if (!raw.startsWith("/") || raw.startsWith("//")) return "/#studio";
    return raw;
  }, [searchParams]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    void fetchMe().then((user) => {
      if (!user) return;
      notifyUserChanged();
      if (nextPath.includes("#")) {
        window.location.replace(nextPath);
        return;
      }
      router.replace(nextPath);
    });
  }, [nextPath, router]);

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
    setPassword("");
    setConfirmPassword("");
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", next);
    if (!params.get("next")) params.set("next", nextPath);
    router.replace(`/auth?${params.toString()}`, { scroll: false });
  }

  function finishAuth() {
    notifyUserChanged();
    // Hash targets like /#studio need a full navigation — App Router
    // replace() often drops or ignores the fragment.
    if (nextPath.includes("#")) {
      window.location.assign(nextPath);
      return;
    }
    router.replace(nextPath);
    router.refresh();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = username.trim();
      if (!user || !password) {
        setError("Enter your username and password");
        return;
      }
      await loginAccount({ username: user, password });
      await finishAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (displayName.trim().length < 2) {
        setError("Display name needs at least 2 characters");
        return;
      }
      if (username.trim().length < 3) {
        setError("Username needs at least 3 letters or numbers");
        return;
      }
      if (password.length < 8) {
        setError("Password needs at least 8 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords don’t match");
        return;
      }
      await registerAccount({
        username: username.trim(),
        displayName: displayName.trim(),
        password,
      });
      await finishAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="font-[family-name:var(--font-brand)] text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl">
        {mode === "register" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
        {mode === "register"
          ? `${APP_SLOGAN} Create an account to save one-of-ones to your binder.`
          : `${APP_SLOGAN} Sign in to save one-of-ones to your binder.`}
      </p>

      <div className="mt-6 mb-6 grid grid-cols-2 gap-1 rounded-xl border border-[var(--line)] bg-[var(--background)]/50 p-1">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={`min-h-11 rounded-lg text-sm font-semibold transition ${
            mode === "login"
              ? "bg-[var(--brass)] text-[#1a140c]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode("register")}
          className={`min-h-11 rounded-lg text-sm font-semibold transition ${
            mode === "register"
              ? "bg-[var(--brass)] text-[#1a140c]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          Create account
        </button>
      </div>

      {mode === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="auth-username" className={label}>
              Username
            </label>
            <input
              id="auth-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={field}
              placeholder="dezyjensen"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="auth-password" className={label}>
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="min-h-12 w-full rounded-xl bg-[var(--brass)] px-4 py-3 font-[family-name:var(--font-brand)] text-base font-semibold text-[#1a140c] transition hover:brightness-110 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="auth-display" className={label}>
              Display name
            </label>
            <input
              id="auth-display"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={field}
              placeholder="Dezy"
              autoComplete="nickname"
              autoFocus
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="auth-reg-username" className={label}>
              Username
            </label>
            <input
              id="auth-reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={field}
              placeholder="dezyjensen"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
            />
            <p className="text-xs text-[var(--ink-muted)]">
              Letters, numbers, and underscores — used to sign in.
            </p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="auth-reg-password" className={label}>
              Password
            </label>
            <input
              id="auth-reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="auth-confirm" className={label}>
              Confirm password
            </label>
            <input
              id="auth-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={field}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="min-h-12 w-full rounded-xl bg-[var(--brass)] px-4 py-3 font-[family-name:var(--font-brand)] text-base font-semibold text-[#1a140c] transition hover:brightness-110 disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>
      )}
    </div>
  );
}
