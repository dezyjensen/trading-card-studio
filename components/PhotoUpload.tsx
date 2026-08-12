"use client";

import { useCallback, useRef, useState } from "react";
import { ImageEditor } from "@/components/ImageEditor";

/** Art window on Modern / Classic / Spectrum */
export const ART_WINDOW_ASPECT = 4 / 3;
/** Full card face on Full Art */
export const FULL_ART_ASPECT = 5 / 7;

type PhotoUploadProps = {
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
  embedded?: boolean;
  /** Crop aspect for the editor — defaults to art-window 4:3 */
  cropAspect?: number;
  /** Shown under the photo controls */
  cropHint?: string;
  /** When true, nudge the user to re-crop (e.g. after switching to Full Art) */
  suggestRecrop?: boolean;
};

export function PhotoUpload({
  photoUrl,
  onPhotoChange,
  embedded = false,
  cropAspect = ART_WINDOW_ASPECT,
  cropHint,
  suggestRecrop = false,
}: PhotoUploadProps) {
  const libraryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);

  const openEditor = useCallback((src: string) => {
    setEditorSrc(src);
  }, []);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("Please choose an image file");
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        setError("Image must be under 12MB");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") openEditor(result);
      };
      reader.onerror = () => setError("Could not read that image");
      reader.readAsDataURL(file);
    },
    [openEditor],
  );

  const isPortraitCrop = cropAspect < 1;
  const aspectHint =
    cropHint ??
    (isPortraitCrop
      ? "Portrait crop — matches the full card face"
      : "Landscape crop — matches the art window");

  return (
    <div className="space-y-3">
      {!embedded && (
        <label className="block text-sm font-medium text-[var(--ink-muted)]">
          Photo
        </label>
      )}

      {suggestRecrop && photoUrl && (
        <div className="rounded-xl border border-[var(--brass)]/40 bg-[var(--brass)]/10 px-3 py-2.5 text-sm text-[var(--ink)]">
          Full Art fills the whole card.{" "}
          <button
            type="button"
            onClick={() => openEditor(photoUrl)}
            className="font-semibold text-[var(--brass)] underline-offset-2 hover:underline"
          >
            Re-crop as portrait
          </button>{" "}
          so faces and full-body shots aren’t cut like the smaller art window.
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={`rounded-xl border border-dashed px-4 py-6 text-center transition ${
          dragging
            ? "border-[var(--brass)] bg-[var(--brass)]/10"
            : "border-[var(--line)] bg-[var(--background)]"
        }`}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt="Selected art"
            className={`mx-auto mb-4 rounded-lg object-cover ${
              isPortraitCrop ? "h-36 w-[6.4rem]" : "h-28 w-28"
            }`}
          />
        ) : (
          <p className="mb-4 text-sm text-[var(--ink-muted)]">
            Drop a photo, or pick from your library / camera
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => libraryRef.current?.click()}
            className="min-h-11 rounded-xl bg-[var(--brass)] px-4 py-2 text-sm font-semibold text-[#1a140c]"
          >
            Photo library
          </button>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="min-h-11 rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)]"
          >
            Take photo
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--ink-muted)]">
          Works on iPhone & Android · opens crop & highlight editor
        </p>
      </div>

      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}
      {photoUrl && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => openEditor(photoUrl)}
            className="min-h-10 text-sm font-semibold text-[var(--brass)] underline-offset-2 hover:underline"
          >
            {isPortraitCrop ? "Edit portrait crop" : "Edit crop / highlights"}
          </button>
          <button
            type="button"
            onClick={() => onPhotoChange(null)}
            className="min-h-10 text-sm text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
          >
            Remove photo
          </button>
        </div>
      )}

      {editorSrc && (
        <ImageEditor
          imageSrc={editorSrc}
          open={Boolean(editorSrc)}
          aspect={cropAspect}
          aspectHint={aspectHint}
          onClose={() => setEditorSrc(null)}
          onApply={(url) => {
            onPhotoChange(url);
            setEditorSrc(null);
          }}
        />
      )}
    </div>
  );
}
