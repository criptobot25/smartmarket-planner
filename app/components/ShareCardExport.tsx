"use client";

import { RefObject } from "react";
import { useAppTranslation } from "../lib/i18n";
import {
  copyShareCardImage,
  downloadShareCardImage,
  generateShareCardDataUrl,
} from "../lib/export/shareCardExportNext";

type ShareCardExportProps = {
  targetRef: RefObject<HTMLElement | null>;
  onStatus: (message: string) => void;
};

export default function ShareCardExport({ targetRef, onStatus }: ShareCardExportProps) {
  const { t } = useAppTranslation();

  const handleShareCardExport = async () => {
    if (!targetRef.current) {
      return;
    }

    const dataUrl = await generateShareCardDataUrl(targetRef.current);

    if (!dataUrl) {
      onStatus(t("shareCard.alert.generateError"));
      return;
    }

    const copied = await copyShareCardImage(dataUrl);

    if (copied) {
      onStatus(t("shareCard.alert.copySuccess"));
      return;
    }

    const downloaded = downloadShareCardImage(dataUrl, `nutripilot-share-card-${Date.now()}.png`);
    onStatus(downloaded ? t("shareCard.download") : t("shareCard.alert.copyFailed"));
  };

  return (
    <button type="button" className="np-btn np-btn-secondary" onClick={handleShareCardExport}>
      {t("shoppingList.shareButton")}
    </button>
  );
}
