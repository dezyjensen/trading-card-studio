import { toPng } from "html-to-image";

export async function exportCardPng(
  element: HTMLElement,
  filename = "trading-card.png",
): Promise<string> {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: undefined,
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();

  return dataUrl;
}

export async function shareCardPng(
  element: HTMLElement,
  title: string,
): Promise<"shared" | "downloaded" | "unsupported"> {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
  });

  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], `${slugify(title) || "trading-card"}.png`, {
    type: "image/png",
  });

  if (
    typeof navigator !== "undefined" &&
    navigator.share &&
    navigator.canShare?.({ files: [file] })
  ) {
    await navigator.share({
      title: `${title} — Trading Card Studio`,
      text: "Made with Trading Card Studio",
      files: [file],
    });
    return "shared";
  }

  const link = document.createElement("a");
  link.download = file.name;
  link.href = dataUrl;
  link.click();
  return "downloaded";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}
