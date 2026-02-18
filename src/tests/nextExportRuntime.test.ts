import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportShoppingListPdfNext } from "../../app/lib/export/exportShoppingListPdfNext";
import {
  copyShareCardImage,
  downloadShareCardImage,
  generateShareCardDataUrl,
} from "../../app/lib/export/shareCardExportNext";

const canExportPdfMock = vi.fn();
const exportShoppingListToPdfMock = vi.fn();
const toPngMock = vi.fn();

vi.mock("../../src/core/premium/features", () => ({
  canExportPdf: () => canExportPdfMock(),
}));

vi.mock("../../src/utils/exportPdf", () => ({
  exportShoppingListToPdf: (options: unknown) => exportShoppingListToPdfMock(options),
}));

vi.mock("html-to-image", () => ({
  toPng: (...args: unknown[]) => toPngMock(...args),
}));

describe("Next export runtime compatibility", () => {
  beforeEach(() => {
    canExportPdfMock.mockReset();
    exportShoppingListToPdfMock.mockReset();
    toPngMock.mockReset();
    localStorage.clear();
  });

  it("keeps PDF export premium-locked", async () => {
    canExportPdfMock.mockReturnValue(false);

    const result = await exportShoppingListPdfNext({
      items: [],
      costTier: "low",
    });

    expect(result).toEqual({ ok: false, reason: "premium_locked" });
    expect(exportShoppingListToPdfMock).not.toHaveBeenCalled();
  });

  it("exports PDF when premium access is allowed", async () => {
    canExportPdfMock.mockReturnValue(true);

    const result = await exportShoppingListPdfNext({
      items: [],
      costTier: "medium",
      totalProtein: 136,
      fitnessGoal: "maintenance",
    });

    expect(result).toEqual({ ok: true });
    expect(exportShoppingListToPdfMock).toHaveBeenCalledTimes(1);
  });

  it("generates and downloads share card image in browser runtime", async () => {
    toPngMock.mockResolvedValue("data:image/png;base64,mock");

    const cardElement = document.createElement("div");
    const dataUrl = await generateShareCardDataUrl(cardElement);

    expect(dataUrl).toBe("data:image/png;base64,mock");

    const clickMock = vi.fn();
    const createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const element = document.createElementNS("http://www.w3.org/1999/xhtml", tag) as HTMLAnchorElement;
      if (tag === "a") {
        Object.defineProperty(element, "click", { value: clickMock });
      }
      return element as HTMLElement;
    });

    const downloaded = downloadShareCardImage("data:image/png;base64,mock", "share.png");
    expect(downloaded).toBe(true);
    expect(clickMock).toHaveBeenCalledTimes(1);

    createElementSpy.mockRestore();
  });

  it("copies share card to clipboard when Clipboard API is available", async () => {
    const writeMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { write: writeMock } });

    class ClipboardItemMock {
      constructor(public value: Record<string, Blob>) {
        void value;
      }
    }

    Object.assign(globalThis, { ClipboardItem: ClipboardItemMock });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        blob: async () => new Blob(["png"], { type: "image/png" }),
      })
    );

    const copied = await copyShareCardImage("data:image/png;base64,mock");

    expect(copied).toBe(true);
    expect(writeMock).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });
});
