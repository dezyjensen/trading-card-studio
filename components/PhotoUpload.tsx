"use client";

import { useCallback, useRef, useState } from "react";

type PhotoUploadProps = {
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
};

export function PhotoUpload({ photoUrl, onPhotoChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file || !file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      if (photoUrl?.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
      onPhotoChange(url);
    },
    [onPhotoChange, photoUrl],
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--ink-muted)]">
        Photo
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
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
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition ${
          dragging
            ? "border-[var(--brass)] bg-[var(--brass)]/10"
            : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--brass)]/60"
        }`}
      >
        <span className="font-[family-name:var(--font-brand)] text-lg text-[var(--ink)]">
          {photoUrl ? "Replace photo" : "Drop a photo here"}
        </span>
        <span className="text-sm text-[var(--ink-muted)]">
          or click to browse · PNG, JPG, WEBP
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {photoUrl && (
        <button
          type="button"
          onClick={() => {
            if (photoUrl.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
            onPhotoChange(null);
          }}
          className="text-sm text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
        >
          Remove photo
        </button>
      )}
    </div>
  );
}
