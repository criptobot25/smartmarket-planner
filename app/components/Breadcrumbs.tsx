import type { Route } from "next";
import Link from "next/link";
import { absoluteUrl } from "../lib/seo";

type BreadcrumbItem = {
  label: string;
  href?: Route;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  currentPath?: string;
};

export function Breadcrumbs({ items, currentPath }: BreadcrumbsProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const isLast = index === items.length - 1;
      const path = item.href
        ? String(item.href)
        : isLast && currentPath
          ? currentPath
          : undefined;

      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: path ? absoluteUrl(path) : undefined,
      };
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <nav aria-label="Breadcrumb" className="np-breadcrumbs">
        <ol>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={`${item.label}-${index}`}>
                {item.href && !isLast ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
                )}
                {!isLast ? <span className="np-breadcrumb-separator">/</span> : null}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
