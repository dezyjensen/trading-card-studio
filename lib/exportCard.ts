import { domToPng } from "modern-screenshot";
import { APP_NAME } from "@/lib/brand";

export type CaptureResult = {
  dataUrl: string;
  blob: Blob;
  file: File;
};

function isIosLike() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS reports as Mac but has touch
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function isMobileLike() {
  if (typeof navigator === "undefined") return false;
  if (isIosLike()) return true;
  return /Android|Mobile/i.test(navigator.userAgent);
}

export function canShareFiles() {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  try {
    const probe = new File([new Blob(["x"], { type: "image/png" })], "x.png", {
      type: "image/png",
    });
    return navigator.canShare?.({ files: [probe] }) ?? false;
  } catch {
    return false;
  }
}

async function captureCardPng(
  element: HTMLElement,
  filename: string,
): Promise<CaptureResult> {
  await waitForImages(element);

  const dataUrl = await domToPng(element, {
    scale: 2,
    backgroundColor: null,
    style: {
      transform: "none",
    },
    filter: (node) => {
      if (!(node instanceof Element)) return true;
      if (node.classList?.contains("export-hide")) return false;
      if (node.classList?.contains("cf-overlay")) return false;
      if (node.classList?.contains("cf-specular")) return false;
      return true;
    },
  });

  if (!dataUrl || dataUrl === "data:,") {
    throw new Error("Empty export result");
  }

  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: "image/png" });
  return { dataUrl, blob, file };
}

function triggerAnchorDownload(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** Open image so iOS users can long-press → Save to Photos. */
function openImageForManualSave(dataUrl: string) {
  const win = window.open();
  if (!win) {
    // Popup blocked — navigate same tab as last resort
    window.location.href = dataUrl;
    return;
  }
  win.document.write(
    `<!doctype html><title>Save card</title>
<style>
  html,body{margin:0;min-height:100%;background:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#eee}
  p{padding:12px 16px;text-align:center;font-size:15px;line-height:1.4;max-width:20rem}
  img{max-width:min(100vw,420px);height:auto;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.45)}
</style>
<p>Touch and hold the card, then choose <strong>Add to Photos</strong> or <strong>Save Image</strong>.</p>
<img src="${dataUrl}" alt="Trading card"/>`,
  );
  win.document.close();
}

export async function exportCardPng(
  element: HTMLElement,
  filename = "trading-card.png",
): Promise<"downloaded" | "shared" | "manual"> {
  const { dataUrl, file } = await captureCardPng(element, filename);

  // Mobile: prefer native share sheet (Save Image / Photos / Files)
  if (isMobileLike() && canShareFiles()) {
    try {
      await navigator.share({
        files: [file],
        title: file.name,
      });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      // Fall through to other methods
    }
  }

  // Desktop + Android: anchor download usually works
  if (!isIosLike()) {
    triggerAnchorDownload(dataUrl, filename);
    return "downloaded";
  }

  // iOS Safari often ignores the download attribute — open for long-press save
  openImageForManualSave(dataUrl);
  return "manual";
}

export async function shareCardPng(
  element: HTMLElement,
  title: string,
): Promise<"shared" | "downloaded" | "manual" | "copied"> {
  const filename = `${slugify(title) || "trading-card"}.png`;
  const { dataUrl, blob, file } = await captureCardPng(element, filename);

  // Only use the system share sheet when it can include the PNG.
  // Text-only share feels like “nothing happened” on desktop.
  if (canShareFiles()) {
    try {
      await navigator.share({
        files: [file],
        title: `${title} — ${APP_NAME}`,
        text: `Made with ${APP_NAME}`,
      });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      // Fall through to clipboard / download
    }
  }

  // Desktop: copy image to clipboard when possible (feels like Share)
  if (
    typeof ClipboardItem !== "undefined" &&
    navigator.clipboard?.write &&
    !isMobileLike()
  ) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      return "copied";
    } catch {
      // Fall through to download
    }
  }

  if (!isIosLike()) {
    triggerAnchorDownload(dataUrl, filename);
    return "downloaded";
  }

  openImageForManualSave(dataUrl);
  return "manual";
}

function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  ).then(() => undefined);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}
