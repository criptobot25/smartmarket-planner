"use client";

import Script from "next/script";

type JsonLdScriptProps = {
  id: string;
  data: Record<string, unknown>;
};

export function JsonLdScript({ id, data }: JsonLdScriptProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
