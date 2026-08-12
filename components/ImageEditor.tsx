"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

type Highlight = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

type ImageEditorProps = {
  imageSrc: string;
  open: boolean;
  onClose: () => void;
  onApply: (dataUrl: string) => void;
  /** Crop frame aspect — Full Art uses portrait (5/7), other formats use art window (4/3). */
  aspect?: number;
  aspectHint?: string;
};

export function ImageEditor({
  imageSrc,
  open,
  onClose,
  onApply,
  aspect = 4 / 3,
  aspectHint,
}: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [tool, setTool] = useState<"crop" | "highlight">("crop");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [drawing, setDrawing] = useState<{
    startX: number;
    startY: number;
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const isPortrait = aspect < 1;

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setHighlights([]);
    setTool("crop");
    setDrawing(null);
    setPreviewUrl(null);
  }, [open, imageSrc, aspect]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function switchToHighlight() {
    if (!croppedAreaPixels) {
      setTool("highlight");
      return;
    }
    const url = await cropToDataUrl(imageSrc, croppedAreaPixels);
    setPreviewUrl(url);
    setHighlights([]);
    setTool("highlight");
  }

  function pointerPos(e: React.PointerEvent) {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }

  async function handleApply() {
    if (!croppedAreaPixels) return;
    setBusy(true);
    try {
      const base = await cropToDataUrl(imageSrc, croppedAreaPixels);
      const dataUrl = await bakeHighlights(base, highlights);
      onApply(dataUrl);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        aria-label="Close editor"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Image editor"
        className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--background)] shadow-2xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-4 py-3">
          <div>
            <h2 className="font-[family-name:var(--font-brand)] text-lg text-[var(--ink)]">
              Edit photo
            </h2>
            {aspectHint && (
              <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{aspectHint}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setTool("crop");
                setPreviewUrl(null);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                tool === "crop"
                  ? "bg-[var(--brass)] text-[#1a140c]"
                  : "bg-[var(--panel)] text-[var(--ink)]"
              }`}
            >
              Crop
            </button>
            <button
              type="button"
              onClick={() => void switchToHighlight()}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                tool === "highlight"
                  ? "bg-[var(--brass)] text-[#1a140c]"
                  : "bg-[var(--panel)] text-[var(--ink)]"
              }`}
            >
              Highlight
            </button>
          </div>
        </div>

        <div
          ref={stageRef}
          className={`relative touch-none bg-black ${
            isPortrait
              ? "h-[min(68vh,560px)]"
              : "h-[min(55vh,420px)]"
          }`}
          onPointerDown={(e) => {
            if (tool !== "highlight") return;
            const p = pointerPos(e);
            setDrawing({ startX: p.x, startY: p.y, x: p.x, y: p.y, w: 0, h: 0 });
            stageRef.current?.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drawing || tool !== "highlight") return;
            const p = pointerPos(e);
            const x = Math.min(drawing.startX, p.x);
            const y = Math.min(drawing.startY, p.y);
            const w = Math.abs(p.x - drawing.startX);
            const h = Math.abs(p.y - drawing.startY);
            setDrawing({ ...drawing, x, y, w, h });
          }}
          onPointerUp={() => {
            if (!drawing || tool !== "highlight") return;
            if (drawing.w > 1.5 && drawing.h > 1.5) {
              setHighlights((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  x: drawing.x,
                  y: drawing.y,
                  w: drawing.w,
                  h: drawing.h,
                },
              ]);
            }
            setDrawing(null);
          }}
        >
          {tool === "crop" ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl ?? imageSrc}
              alt=""
              className="h-full w-full object-contain pointer-events-none"
              draggable={false}
            />
          )}

          {tool === "highlight" && (
            <>
              {highlights.map((h) => (
                <div
                  key={h.id}
                  className="pointer-events-none absolute rounded-sm"
                  style={{
                    left: `${h.x}%`,
                    top: `${h.y}%`,
                    width: `${h.w}%`,
                    height: `${h.h}%`,
                    background: "rgba(255, 230, 40, 0.45)",
                    mixBlendMode: "multiply",
                    boxShadow: "inset 0 0 0 1px rgba(255,200,0,0.8)",
                  }}
                />
              ))}
              {drawing && (
                <div
                  className="pointer-events-none absolute rounded-sm"
                  style={{
                    left: `${drawing.x}%`,
                    top: `${drawing.y}%`,
                    width: `${drawing.w}%`,
                    height: `${drawing.h}%`,
                    background: "rgba(255, 230, 40, 0.35)",
                    boxShadow: "inset 0 0 0 1px rgba(255,200,0,0.9)",
                  }}
                />
              )}
            </>
          )}
        </div>

        <div className="space-y-3 border-t border-[var(--line)] px-4 py-4">
          {tool === "crop" && (
            <label className="flex items-center gap-3 text-sm text-[var(--ink-muted)]">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[var(--brass)]"
              />
            </label>
          )}
          {tool === "highlight" && (
            <div className="flex items-center justify-between gap-3 text-sm text-[var(--ink-muted)]">
              <span>Drag to mark yellow highlights on the cropped art</span>
              <button
                type="button"
                disabled={highlights.length === 0}
                onClick={() => setHighlights([])}
                className="underline disabled:opacity-40"
              >
                Clear
              </button>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy || !croppedAreaPixels}
              onClick={handleApply}
              className="rounded-xl bg-[var(--brass)] px-4 py-2 text-sm font-semibold text-[#1a140c] disabled:opacity-50"
            >
              {busy ? "Applying…" : "Apply to card"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function cropToDataUrl(src: string, crop: Area): Promise<string> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(crop.width));
  canvas.height = Math.max(1, Math.round(crop.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return canvas.toDataURL("image/jpeg", 0.92);
}

async function bakeHighlights(src: string, highlights: Highlight[]): Promise<string> {
  if (highlights.length === 0) return src;
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(image, 0, 0);
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgba(255, 220, 40, 0.55)";
  for (const h of highlights) {
    ctx.fillRect(
      (h.x / 100) * canvas.width,
      (h.y / 100) * canvas.height,
      (h.w / 100) * canvas.width,
      (h.h / 100) * canvas.height,
    );
  }
  ctx.globalCompositeOperation = "source-over";
  return canvas.toDataURL("image/jpeg", 0.92);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
