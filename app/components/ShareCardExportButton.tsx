"use client";

import { RefObject } from "react";
import dynamic from "next/dynamic";

const ShareCardExport = dynamic(() => import("./ShareCardExport"), {
  ssr: false,
});

type ShareCardExportButtonProps = {
  targetRef: RefObject<HTMLElement | null>;
  onStatus: (message: string) => void;
};

export default function ShareCardExportButton({ targetRef, onStatus }: ShareCardExportButtonProps) {
  return <ShareCardExport targetRef={targetRef} onStatus={onStatus} />;
}
