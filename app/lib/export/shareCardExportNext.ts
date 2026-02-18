"use client";

export interface ShareCardImageOptions {
  pixelRatio?: number;
  backgroundColor?: string;
}

function hasBrowserRuntime(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export async function generateShareCardDataUrl(
  element: HTMLElement,
  options: ShareCardImageOptions = {}
): Promise<string | null> {
  if (!hasBrowserRuntime()) {
    return null;
  }

  const { toPng } = await import("html-to-image");

  return toPng(element, {
    cacheBust: true,
    pixelRatio: options.pixelRatio ?? 2,
    backgroundColor: options.backgroundColor ?? "transparent",
  });
}

export function downloadShareCardImage(dataUrl: string, fileName: string): boolean {
  if (!hasBrowserRuntime()) {
    return false;
  }

  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.click();
  return true;
}

export async function copyShareCardImage(dataUrl: string): Promise<boolean> {
  if (!hasBrowserRuntime()) {
    return false;
  }

  if (!("clipboard" in navigator) || typeof navigator.clipboard.write !== "function") {
    return false;
  }

  if (typeof ClipboardItem === "undefined") {
    return false;
  }

  const blob = await fetch(dataUrl).then((response) => response.blob());

  await navigator.clipboard.write([
    new ClipboardItem({
      "image/png": blob,
    }),
  ]);

  return true;
}
