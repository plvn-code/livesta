import Link from "next/link";
import { Fragment } from "react";

export function Logo() {
  return (
    <span className="logo" aria-label="Livesta One">
      <span className="logo-word">LIVESTA</span>
      <span className="logo-sub">one · beauty store</span>
    </span>
  );
}

/** A heading whose lines slide up from a mask when it scrolls into view. Lines are split on "\n"; *word* becomes italic rose. */
export function Split({ text, as: Tag = "h2", className, delay = 0 }: { text: string; as?: "h1" | "h2" | "p"; className?: string; delay?: number }) {
  return (
    <Tag className={className} data-reveal="lines" style={{ ["--d" as string]: `${delay}s` }}>
      {text.split("\n").map((line, i) => (
        <span key={i} className="split-line" style={{ ["--i" as string]: i }}>
          <span>
            {line.split(/(\*[^*]+\*)/).map((part, j) =>
              part.startsWith("*") ? <em key={j}>{part.slice(1, -1)}</em> : <Fragment key={j}>{part}</Fragment>,
            )}
          </span>
        </span>
      ))}
    </Tag>
  );
}

export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, ...(it.href ? { item: it.href } : {}) })),
  };
  return (
    <>
      <ol className="crumbs">
        {items.map((it) => (
          <li key={it.label}>{it.href ? <Link href={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}</li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}

export function PageHero({ eyebrow, title, lead, crumbs, children }: { eyebrow?: string; title: string; lead?: string; crumbs?: { href?: string; label: string }[]; children?: React.ReactNode }) {
  return (
    <section className="page-hero">
      <div className="wrap">
        {crumbs && <Crumbs items={crumbs} />}
        {eyebrow && (
          <p className="eyebrow" data-reveal>
            {eyebrow}
          </p>
        )}
        <Split as="h1" className="display-lg" text={title} />
        {lead && (
          <p className="lead" data-reveal style={{ ["--d" as string]: ".15s" }}>
            {lead}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((t, i) => (
          <span key={i}>
            {t} <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}
