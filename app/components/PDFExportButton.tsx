"use client";

import dynamic from "next/dynamic";

const PDFExport = dynamic(() => import("./PDFExport"), {
  ssr: false,
});

type PDFExportButtonProps = {
  onStatus: (message: string) => void;
};

export default function PDFExportButton({ onStatus }: PDFExportButtonProps) {
  return <PDFExport onStatus={onStatus} />;
}
