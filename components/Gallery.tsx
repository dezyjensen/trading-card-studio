"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Link from "next/link";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BinderCardTile } from "@/components/BinderCardTile";
import { CardFullscreen } from "@/components/CardFullscreen";
import {
  getAllSaves,
  getBinderOrder,
  deleteSavedCard,
  setActiveSaveId,
  setBinderOrder,
  SAVES_CHANGED_EVENT,
  USER_CHANGED_EVENT,
  notifySavesChanged,
} from "@/lib/saves";
import {
  deleteRemoteCard,
  fetchBinderOrder,
  fetchMe,
  listRemoteCards,
  saveBinderOrder,
  setActiveRemoteCard,
  type ApiSavedCard,
} from "@/lib/api/client";
import { BACKEND_ENABLED, DEMO_USER_ID, STATIC_DEMO } from "@/lib/features";
import { RARITIES } from "@/lib/themes";

type SavedCard = ApiSavedCard;

function localSavesAsApi(): ApiSavedCard[] {
  return getAllSaves(DEMO_USER_ID).map((s, i) => ({
    id: s.id,
    name: s.name,
    collectorNumber: s.state.collectorNumber ?? i + 1,
    updatedAt: s.updatedAt,
    state: s.state,
  }));
}

const SLOTS_PER_PAGE = 9;

type SortMode = "binder" | "name" | "rarity" | "type" | "newest" | "hp";

const RARITY_RANK: Record<string, number> = {
  mythic: 4,
  rare: 3,
  uncommon: 2,
  common: 1,
};

export function Gallery() {
  const [userId, setUserId] = useState<string | null>(null);
  const [saves, setSaves] = useState<SavedCard[]>([]);
  const [binderOrder, setBinderOrderState] = useState<string[]>([]);
  const [sort, setSort] = useState<SortMode>("binder");
  const [page, setPage] = useState(0);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (STATIC_DEMO || !BACKEND_ENABLED) {
      setUserId(DEMO_USER_ID);
      setSaves(localSavesAsApi());
      setBinderOrderState(getBinderOrder(DEMO_USER_ID));
      return;
    }
    try {
      const user = await fetchMe();
      setUserId(user?.id ?? null);
      if (!user) {
        setSaves([]);
        setBinderOrderState([]);
        return;
      }
      const [cards, order] = await Promise.all([
        listRemoteCards(),
        fetchBinderOrder(),
      ]);
      setSaves(cards);
      setBinderOrderState(order);
    } catch {
      setUserId(null);
      setSaves([]);
      setBinderOrderState([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
    function onChange() {
      void refresh();
    }
    window.addEventListener(USER_CHANGED_EVENT, onChange);
    window.addEventListener(SAVES_CHANGED_EVENT, onChange);
    return () => {
      window.removeEventListener(USER_CHANGED_EVENT, onChange);
      window.removeEventListener(SAVES_CHANGED_EVENT, onChange);
    };
  }, [refresh]);

  const saveMap = useMemo(() => {
    const map = new Map<string, SavedCard>();
    for (const s of saves) map.set(s.id, s);
    return map;
  }, [saves]);

  const orderedIds = useMemo(() => {
    if (sort === "binder") return binderOrder.filter((id) => saveMap.has(id));

    const list = [...saves];
    switch (sort) {
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rarity":
        list.sort(
          (a, b) =>
            (RARITY_RANK[b.state.rarity] ?? 0) - (RARITY_RANK[a.state.rarity] ?? 0) ||
            a.name.localeCompare(b.name),
        );
        break;
      case "type":
        list.sort(
          (a, b) =>
            a.state.typeLabel.localeCompare(b.state.typeLabel) ||
            a.name.localeCompare(b.name),
        );
        break;
      case "newest":
        list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        break;
      case "hp":
        list.sort(
          (a, b) => b.state.hp - a.state.hp || a.name.localeCompare(b.name),
        );
        break;
    }
    return list.map((s) => s.id);
  }, [sort, binderOrder, saves, saveMap]);

  const pageCount = Math.max(1, Math.ceil(orderedIds.length / SLOTS_PER_PAGE) || 1);
  const safePage = Math.min(page, pageCount - 1);

  useEffect(() => {
    if (page > pageCount - 1) setPage(Math.max(0, pageCount - 1));
  }, [page, pageCount]);

  const pageIds = useMemo(() => {
    const start = safePage * SLOTS_PER_PAGE;
    const slice = orderedIds.slice(start, start + SLOTS_PER_PAGE);
    // Pad to 9 slots for binder look
    while (slice.length < SLOTS_PER_PAGE) slice.push(`empty-${slice.length}`);
    return slice;
  }, [orderedIds, safePage]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
  );

  const canDrag = sort === "binder" && Boolean(userId);

  function onDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    if (id.startsWith("empty-")) return;
    setActiveId(id);
  }

  function persistBinderOrder(next: string[]) {
    setBinderOrderState(next);
    if (STATIC_DEMO || !BACKEND_ENABLED) {
      setBinderOrder(DEMO_USER_ID, next);
      return;
    }
    void saveBinderOrder(next);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    if (!userId || !canDrag) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr.startsWith("empty-") || overIdStr.startsWith("empty-")) {
      // Dropping onto empty slot at end of page: append/move to that page index
      if (overIdStr.startsWith("empty-") && !activeIdStr.startsWith("empty-")) {
        const emptyIndex = Number(overIdStr.replace("empty-", ""));
        const globalTo = safePage * SLOTS_PER_PAGE + emptyIndex;
        const from = orderedIds.indexOf(activeIdStr);
        if (from < 0) return;
        // Clamp to end of real cards
        const to = Math.min(globalTo, orderedIds.length - 1);
        const next = arrayMove(orderedIds, from, Math.max(from < to ? to : to, 0));
        persistBinderOrder(next);
      }
      return;
    }

    const oldIndex = orderedIds.indexOf(activeIdStr);
    const newIndex = orderedIds.indexOf(overIdStr);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(orderedIds, oldIndex, newIndex);
    persistBinderOrder(next);
  }

  const activeSave = activeId ? saveMap.get(activeId) : null;
  const previewSave = previewId ? saveMap.get(previewId) : null;

  async function handleDelete(save: SavedCard) {
    const label = save.name?.trim() || "this card";
    if (!window.confirm(`Delete “${label}” from your binder?`)) return;
    if (previewId === save.id) setPreviewId(null);

    if (STATIC_DEMO || !BACKEND_ENABLED) {
      deleteSavedCard(DEMO_USER_ID, save.id);
    } else {
      try {
        await deleteRemoteCard(save.id);
        notifySavesChanged();
      } catch (err) {
        console.error(err);
        window.alert("Could not delete card. Try again.");
        return;
      }
    }
    await refresh();
  }

  return (
    <section
      id="gallery"
      className="relative scroll-mt-8 border-t border-[var(--line)] bg-[var(--background)]"
    >
      <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--brass)]">
              Collection
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-brand)] text-3xl text-[var(--ink)] sm:text-4xl">
              Binder gallery
            </h2>
            <p className="mt-2 max-w-lg text-[var(--ink-muted)]">
              Your saved cards as pocket art — expand to preview, delete to
              remove, or edit in the studio. Drag to rearrange in binder order.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-[var(--ink-muted)]">
              Sort
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortMode);
                  setPage(0);
                }}
                className="ml-2 min-h-11 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              >
                <option value="binder">Binder order</option>
                <option value="name">Name A–Z</option>
                <option value="rarity">Rarity</option>
                <option value="type">Type</option>
                <option value="newest">Newest</option>
                <option value="hp">HP</option>
              </select>
            </label>
          </div>
        </div>

        {!userId ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-6 py-14 text-center">
            <p className="font-[family-name:var(--font-brand)] text-xl text-[var(--ink)]">
              {STATIC_DEMO ? "Empty binder" : "Sign in to open your binder"}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              {STATIC_DEMO
                ? "Save a card in the studio to add it to your collection."
                : "Save cards in the studio, then arrange them here."}
            </p>
            {STATIC_DEMO ? (
              <a
                href="#studio"
                className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--brass)] px-5 py-2.5 text-sm font-semibold text-[#1a140c]"
              >
                Go to studio
              </a>
            ) : (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href={`/auth?mode=login&next=${encodeURIComponent("/#gallery")}`}
                  className="inline-flex min-h-11 items-center rounded-xl bg-[var(--brass)] px-5 py-2.5 text-sm font-semibold text-[#1a140c]"
                >
                  Sign in
                </Link>
                <Link
                  href={`/auth?mode=register&next=${encodeURIComponent("/#gallery")}`}
                  className="inline-flex min-h-11 items-center rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)]"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        ) : saves.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-6 py-14 text-center">
            <p className="font-[family-name:var(--font-brand)] text-xl text-[var(--ink)]">
              Empty binder
            </p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Save a card in the studio to add it to your collection.
            </p>
            <a
              href="#studio"
              className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--brass)] px-5 py-2.5 text-sm font-semibold text-[#1a140c]"
            >
              Go to studio
            </a>
          </div>
        ) : (
          <>
            <div className="binder-book mt-8 overflow-hidden rounded-2xl border border-[var(--line)] p-3 sm:p-5">
              <div className="binder-page relative rounded-xl p-3 sm:p-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext
                    items={pageIds.filter((id) => !id.startsWith("empty-"))}
                    strategy={rectSortingStrategy}
                    disabled={!canDrag}
                  >
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {pageIds.map((id) => {
                        if (id.startsWith("empty-")) {
                          return (
                            <BinderPocket key={id} empty>
                              <div className="flex aspect-[5/7] items-center justify-center rounded-md border border-dashed border-black/15 bg-black/[0.03] text-[10px] uppercase tracking-wider text-black/25">
                                Empty
                              </div>
                            </BinderPocket>
                          );
                        }
                        const save = saveMap.get(id);
                        if (!save) return null;
                        return (
                          <SortablePocket
                            key={id}
                            id={id}
                            disabled={!canDrag}
                            save={save}
                            onOpen={() => setPreviewId(save.id)}
                            onDelete={() => void handleDelete(save)}
                            onEdit={() => {
                              if (!userId) return;
                              if (STATIC_DEMO || !BACKEND_ENABLED) {
                                setActiveSaveId(DEMO_USER_ID, save.id);
                              } else {
                                void setActiveRemoteCard(save.id);
                              }
                              window.dispatchEvent(
                                new CustomEvent("tcs-load-save", { detail: save }),
                              );
                              document
                                .getElementById("studio")
                                ?.scrollIntoView({ behavior: "smooth" });
                            }}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>

                  <DragOverlay dropAnimation={null}>
                    {activeSave ? (
                      <div className="w-[110px] rotate-2 opacity-95 shadow-2xl sm:w-[130px]">
                        <BinderCardTile
                          state={activeSave.state}
                          name={activeSave.name}
                          collectorNumber={activeSave.collectorNumber}
                        />
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={safePage <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="min-h-11 rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-40"
              >
                Previous page
              </button>
              <p className="text-sm text-[var(--ink-muted)]">
                Page {safePage + 1} of {pageCount}
                {canDrag ? " · drag to rearrange" : ""}
              </p>
              <button
                type="button"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                className="min-h-11 rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-40"
              >
                Next page
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-[var(--ink-muted)]">
              {saves.length} card{saves.length === 1 ? "" : "s"} ·{" "}
              {RARITIES.map((r) => r.label).join(" · ")} sorts available
            </p>
          </>
        )}
      </div>

      {previewSave && (
        <CardFullscreen
          state={previewSave.state}
          open={Boolean(previewSave)}
          onClose={() => setPreviewId(null)}
        />
      )}
    </section>
  );
}

function BinderPocket({
  children,
  empty,
}: {
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div
      className={`binder-pocket rounded-lg p-1.5 sm:p-2 ${
        empty ? "opacity-70" : ""
      }`}
    >
      {children}
    </div>
  );
}

function ExpandIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function SortablePocket({
  id,
  save,
  disabled,
  onOpen,
  onEdit,
  onDelete,
}: {
  id: string;
  save: SavedCard;
  disabled: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="binder-pocket rounded-lg p-1 sm:p-1.5"
    >
      <div className="relative">
        <button
          type="button"
          className={`relative block w-full overflow-hidden rounded-md text-left ${
            disabled ? "" : "cursor-grab active:cursor-grabbing"
          }`}
          onClick={onOpen}
          aria-label={`Expand “${save.name || "card"}”`}
          {...attributes}
          {...listeners}
        >
          <BinderCardTile
            state={save.state}
            name={save.name}
            collectorNumber={save.collectorNumber}
          />
        </button>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-1 sm:p-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-md bg-black/65 text-white/90 shadow-sm backdrop-blur-sm transition hover:bg-red-600 hover:text-white sm:h-8 sm:w-8"
            aria-label={`Delete “${save.name || "card"}” from binder`}
          >
            <TrashIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-md bg-black/65 text-white/90 shadow-sm backdrop-blur-sm transition hover:bg-[var(--brass)] hover:text-[#1a140c] sm:h-8 sm:w-8"
            aria-label={`Expand “${save.name || "card"}” to full screen`}
          >
            <ExpandIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="mt-1.5 min-h-8 w-full rounded-md bg-black/10 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink)] transition hover:bg-[var(--brass)]/25"
      >
        Edit in studio
      </button>
    </div>
  );
}
