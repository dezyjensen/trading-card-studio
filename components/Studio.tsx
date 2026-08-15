"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { flushSync } from "react-dom";
import { CardCustomizer } from "@/components/CardCustomizer";
import { CardFullscreen } from "@/components/CardFullscreen";
import { ExportActions, ShareCardButton } from "@/components/ExportActions";
import { TradingCard } from "@/components/TradingCard";
import {
  fetchActiveCard,
  fetchMe,
  saveRemoteCard,
  type ApiSavedCard,
  type ApiUser,
} from "@/lib/api/client";
import { BACKEND_ENABLED, DEMO_USER_ID, STATIC_DEMO } from "@/lib/features";
import {
  loadActiveCard,
  newBlankCard,
  notifySavesChanged,
  saveCard,
  USER_CHANGED_EVENT,
} from "@/lib/saves";
import {
  DEFAULT_CARD_STATE,
  classicTypePatch,
  getTheme,
  type CardState,
  type ThemeId,
} from "@/lib/themes";

const pressProps = {
  onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.dataset.pressed = "true";
  },
  onPointerUp: (e: PointerEvent<HTMLButtonElement>) => {
    delete e.currentTarget.dataset.pressed;
  },
  onPointerLeave: (e: PointerEvent<HTMLButtonElement>) => {
    delete e.currentTarget.dataset.pressed;
  },
  onPointerCancel: (e: PointerEvent<HTMLButtonElement>) => {
    delete e.currentTarget.dataset.pressed;
  },
};

const pressClass =
  "transition duration-150 active:scale-[0.95] active:brightness-90 active:shadow-inner data-[pressed]:scale-[0.95] data-[pressed]:brightness-90 data-[pressed]:shadow-inner";

export function Studio() {
  const [state, setState] = useState<CardState>(DEFAULT_CARD_STATE);
  const [user, setUser] = useState<ApiUser | null>(
    STATIC_DEMO
      ? { id: DEMO_USER_ID, username: "demo", displayName: "You" }
      : null,
  );
  const [exporting, setExporting] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeSaveId, setActiveSaveIdState] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [needsAccount, setNeedsAccount] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  const applyUserSession = useCallback(async (opts?: { loadActive?: boolean }) => {
    const loadActive = opts?.loadActive ?? false;

    if (STATIC_DEMO || !BACKEND_ENABLED) {
      setUser({ id: DEMO_USER_ID, username: "demo", displayName: "You" });
      setNeedsAccount(false);
      if (!loadActive) return;
      const active = loadActiveCard(DEMO_USER_ID);
      if (active) {
        setState({
          ...DEFAULT_CARD_STATE,
          ...active.state,
          illustrator: active.state.illustrator || "You",
        });
        setActiveSaveIdState(active.id);
      }
      return;
    }

    try {
      const nextUser = await fetchMe();
      setUser(nextUser);
      if (!nextUser) {
        setActiveSaveIdState(null);
        setNeedsAccount(false);
        return;
      }
      setNeedsAccount(false);

      if (!loadActive) {
        setState((prev) => ({
          ...prev,
          illustrator:
            prev.illustrator === "You" || !prev.illustrator
              ? nextUser.displayName
              : prev.illustrator,
        }));
        return;
      }

      try {
        const active = await fetchActiveCard();
        if (active) {
          setState({
            ...DEFAULT_CARD_STATE,
            ...active.state,
            illustrator: active.state.illustrator || nextUser.displayName,
          });
          setActiveSaveIdState(active.id);
        } else {
          setState((prev) => ({
            ...prev,
            illustrator:
              prev.illustrator === "You" || !prev.illustrator
                ? nextUser.displayName
                : prev.illustrator,
          }));
        }
      } catch (err) {
        console.error("Could not load active card", err);
        setState((prev) => ({
          ...prev,
          illustrator:
            prev.illustrator === "You" || !prev.illustrator
              ? nextUser.displayName
              : prev.illustrator,
        }));
      }
    } catch {
      setUser(null);
      setActiveSaveIdState(null);
    }
  }, []);

  useEffect(() => {
    void applyUserSession({ loadActive: true });
    function onUserChanged() {
      void applyUserSession({ loadActive: false });
    }
    function onLoadSave(e: Event) {
      const save = (e as CustomEvent<ApiSavedCard>).detail;
      if (!save) return;
      setState({ ...DEFAULT_CARD_STATE, ...save.state });
      setActiveSaveIdState(save.id);
      setSaveMessage(`Loaded “${save.name}”`);
    }
    function onApplyTemplate(e: Event) {
      const template = (e as CustomEvent<CardState>).detail;
      if (!template) return;
      setState({
        ...DEFAULT_CARD_STATE,
        ...template,
        collectorNumber: DEFAULT_CARD_STATE.collectorNumber,
      });
      setActiveSaveIdState(null);
      setNeedsAccount(false);
      setSaveMessage(
        `Using “${template.name || "sample"}” as a template — edit & save when ready`,
      );
    }
    function onNewCard() {
      void (async () => {
        if (STATIC_DEMO || !BACKEND_ENABLED) {
          setUser({ id: DEMO_USER_ID, username: "demo", displayName: "You" });
          setState(newBlankCard("You"));
          setActiveSaveIdState(null);
          setSaveMessage("Started a new card");
          return;
        }
        const nextUser = await fetchMe();
        setUser(nextUser);
        setState(newBlankCard(nextUser?.displayName));
        setActiveSaveIdState(null);
        setSaveMessage("Started a new card");
      })();
    }
    window.addEventListener(USER_CHANGED_EVENT, onUserChanged);
    window.addEventListener("tcs-load-save", onLoadSave);
    window.addEventListener("tcs-apply-template", onApplyTemplate);
    window.addEventListener("tcs-new-card", onNewCard);
    return () => {
      window.removeEventListener(USER_CHANGED_EVENT, onUserChanged);
      window.removeEventListener("tcs-load-save", onLoadSave);
      window.removeEventListener("tcs-apply-template", onApplyTemplate);
      window.removeEventListener("tcs-new-card", onNewCard);
    };
  }, [applyUserSession]);

  function patch(next: Partial<CardState>) {
    setState((prev) => ({ ...prev, ...next }));
    setSaveMessage(null);
  }

  function onThemeChange(themeId: ThemeId) {
    const theme = getTheme(themeId);
    patch({
      themeId,
      accent: theme.defaultAccent,
      secondary: theme.defaultSecondary,
      typeLabel: theme.defaultType,
      holo: theme.foil,
    });
  }

  function onClassicTypeChange(typeLabel: string) {
    patch(classicTypePatch(typeLabel));
  }

  async function handleSave(asNew = false) {
    if (STATIC_DEMO || !BACKEND_ENABLED) {
      setSaveBusy(true);
      try {
        const result = saveCard(
          DEMO_USER_ID,
          state,
          asNew ? null : activeSaveId,
        );
        if (!result.ok) {
          setSaveMessage(result.error);
          return;
        }
        setActiveSaveIdState(result.save.id);
        setSaveMessage(
          result.warning ||
            (asNew
              ? `Added “${result.save.name}” to your binder`
              : `Saved “${result.save.name}” to binder`),
        );
        notifySavesChanged();
      } finally {
        setSaveBusy(false);
      }
      return;
    }

    let currentUser = user;
    if (!currentUser) {
      try {
        currentUser = await fetchMe();
        setUser(currentUser);
      } catch {
        currentUser = null;
      }
    }
    if (!currentUser) {
      setNeedsAccount(true);
      setSaveMessage("Sign in to save to your binder");
      return;
    }
    setSaveBusy(true);
    try {
      const card = await saveRemoteCard(state, asNew ? null : activeSaveId);
      setActiveSaveIdState(card.id);
      setState((prev) => ({
        ...prev,
        collectorNumber: card.collectorNumber ?? card.state.collectorNumber,
      }));
      setSaveMessage(
        asNew
          ? `Added “${card.name}” to your binder`
          : `Saved “${card.name}” to binder`,
      );
      setNeedsAccount(false);
      notifySavesChanged();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save card";
      if (/sign in|unauthorized|401/i.test(message)) {
        setUser(null);
        setNeedsAccount(true);
        setSaveMessage("Sign in to save to your binder");
      } else {
        setSaveMessage(message);
      }
    } finally {
      setSaveBusy(false);
    }
  }

  const startExport = () => flushSync(() => setExporting(true));
  const endExport = () => flushSync(() => setExporting(false));

  const actionBar = (
    <div className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={saveBusy}
          onClick={() => void handleSave(false)}
          {...pressProps}
          className={`min-h-12 rounded-xl bg-[var(--brass)] px-3 py-3 font-[family-name:var(--font-brand)] text-sm font-semibold text-[#1a140c] shadow-sm hover:brightness-110 disabled:opacity-60 sm:text-base ${pressClass}`}
        >
          {saveBusy ? "Saving…" : "Save to binder"}
        </button>
        <ExportActions
          cardRef={cardRef}
          cardName={state.name}
          photoButtonOnly
          onExportStart={startExport}
          onExportEnd={endExport}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ShareCardButton
          cardRef={cardRef}
          cardName={state.name}
          onExportStart={startExport}
          onExportEnd={endExport}
          onStatus={(message) => {
            if (message) setSaveMessage(message);
          }}
        />
        <button
          type="button"
          onClick={() => {
            setState(newBlankCard(user?.displayName));
            setActiveSaveIdState(null);
            setSaveMessage("Started a new card");
          }}
          {...pressProps}
          className={`min-h-10 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--ink-muted)] hover:border-[var(--brass)] hover:text-[var(--ink)] data-[pressed]:bg-[var(--background)] active:bg-[var(--background)] ${pressClass}`}
        >
          New card
        </button>
        {activeSaveId && (
          <button
            type="button"
            disabled={saveBusy}
            onClick={() => void handleSave(true)}
            {...pressProps}
            className={`min-h-10 col-span-2 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--ink)] hover:border-[var(--brass)] data-[pressed]:bg-[var(--background)] active:bg-[var(--background)] disabled:opacity-60 ${pressClass}`}
          >
            Save as new
          </button>
        )}
      </div>

      {saveMessage && (
        <div
          className={`text-center text-xs ${needsAccount ? "text-amber-500" : "text-[var(--ink-muted)]"}`}
          role="status"
        >
          <p>{saveMessage}</p>
          {needsAccount && !STATIC_DEMO && (
            <p className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <Link
                href={`/auth?mode=login&next=${encodeURIComponent("/#studio")}`}
                className="font-semibold text-[var(--brass)] underline-offset-2 hover:underline"
              >
                Sign in
              </Link>
              <span className="opacity-50">or</span>
              <Link
                href={`/auth?mode=register&next=${encodeURIComponent("/#studio")}`}
                className="font-semibold text-[var(--brass)] underline-offset-2 hover:underline"
              >
                create an account
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section
      id="studio"
      className="relative scroll-mt-8 border-t border-[var(--line)] bg-[var(--studio-bg)]"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr_min(100%,320px)] lg:gap-10 lg:px-8 lg:py-14">
        <div className="space-y-8">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--brass)]">
              Studio
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-brand)] text-3xl text-[var(--ink)] sm:text-4xl">
              Make your card
            </h2>
            <p className="mt-2 max-w-lg text-[var(--ink-muted)]">
              Turn your photo into a collectible — pick a format, save it to
              your binder, then download it to your phone.
            </p>
          </div>

          <CardCustomizer
            state={state}
            onChange={patch}
            onThemeChange={onThemeChange}
            onClassicTypeChange={onClassicTypeChange}
            onPhotoChange={(photoUrl) => patch({ photoUrl })}
          />
        </div>

        <div className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <div className="flex justify-center overflow-visible px-2 pt-1 pb-1 sm:px-3">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setFullscreen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFullscreen(true);
                }
              }}
              className="group w-full max-w-[min(300px,calc((100vh-7rem)*5/7))] cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--studio-bg)]"
              aria-label="Open full screen card preview"
            >
              <div
                ref={cardRef}
                className="w-full overflow-visible transition duration-300 group-hover:brightness-110"
              >
                <TradingCard
                  state={state}
                  interactive={!exporting && !fullscreen}
                  forExport={exporting}
                />
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-[var(--ink-muted)]">
            Tap preview for full screen
          </p>

          {actionBar}
        </div>
      </div>

      <CardFullscreen
        state={state}
        open={fullscreen}
        onClose={closeFullscreen}
      />
    </section>
  );
}
