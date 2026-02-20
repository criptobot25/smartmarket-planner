"use client";

import Image from "next/image";

type PreviewCard = {
  titleKey: string;
  imageSrc: string;
  width: number;
  height: number;
};

type LandingPreviewSectionProps = {
  previewCards: PreviewCard[];
  t: (key: string) => string;
};

export function LandingPreviewSection({ previewCards, t }: LandingPreviewSectionProps) {
  return (
    <section className="mockup-section">
      <div className="section-wrap">
        <h2>{t("landingV2.previewTitle")}</h2>
        <div className="mockup-grid">
          {previewCards.map((card) => (
            <article key={card.titleKey} className="mockup-card mockup-image-card" role="img" aria-label={t(card.titleKey)}>
              <Image
                src={card.imageSrc}
                alt={t(card.titleKey)}
                width={card.width}
                height={card.height}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="mockup-image"
              />
              <div className="mockup-image-overlay" aria-hidden />
              <span className="mockup-label">{t(card.titleKey)}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
