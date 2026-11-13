import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox, Gallery } from "@/components/Buy";
import { Icon } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { Crumbs } from "@/components/Shared";
import { discount, getProduct, getSection, getSeries, products, related, subName, toCard } from "@/lib/catalog";
import { price } from "@/lib/format";
import { delivery, payment, site } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  const lead = p.desc[0]?.slice(0, 150) ?? `${p.name} за ціною каталогу LIVESTA.`;
  return {
    title: `${p.name}${p.vol ? `, ${p.vol}` : ""}`,
    description: `${price(p.price)} · ${lead}`,
    alternates: { canonical: `/tovar/${p.slug}` },
    openGraph: { images: p.imgs ? [`/images/p/${p.id}.webp`] : undefined },
  };
}

/** livesta.ua labels → our accordion titles. */
const MORE_TITLES: Record<string, string> = {
  "СКЛАД ПРОДУКТУ": "Склад",
  "ЗАСТОСУВАННЯ ТА ЗАПОБІЖНІ ЗАХОДИ": "Як застосовувати",
  ХАРАКТЕРИСТИКИ: "Характеристики",
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const c = toCard(p);
  const sec = getSection(p.section);
  const sub = subName(p.section, p.sub);
  const series = p.series ? getSeries(p.series) : undefined;
  const d = discount(p);
  const rel = related(p, 8);
  const extra = Object.entries(p.more).filter(([k, v]) => MORE_TITLES[k] && v.length);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.id,
    brand: { "@type": "Brand", name: "LIVESTA" },
    image: p.imgs ? `${site.url}/images/p/${p.id}.webp` : undefined,
    description: p.desc.join(" ").slice(0, 500) || undefined,
    offers: { "@type": "Offer", price: p.price, priceCurrency: "UAH", availability: "https://schema.org/InStock", url: `${site.url}/tovar/${p.slug}` },
  };

  return (
    <>
      <div className="wrap" style={{ paddingTop: 28 }}>
        <Crumbs
          items={[
            { href: "/", label: "Головна" },
            { href: "/katalog", label: "Каталог" },
            ...(sec ? [{ href: `/katalog/${sec.id}`, label: sec.name }] : []),
            ...(sub && sec ? [{ href: `/katalog/${sec.id}?sub=${p.sub}`, label: sub }] : []),
            { label: p.name },
          ]}
        />
        <div className="pp">
          <Gallery id={p.id} count={p.imgs} name={p.name} discount={d} />
          <div className="pp-info">
            {series ? (
              <Link href={`/katalog?brand=${series.id}`} className="pp-series">
                {series.name}
              </Link>
            ) : (
              <p className="pp-series">LIVESTA</p>
            )}
            <h1 className="pp-title">{p.name}</h1>
            <div className="pp-meta">
              {p.vol && <span>{p.vol}</span>}
              <span>Код {p.id}</span>
              <span style={{ color: "var(--ok)" }}>● В наявності</span>
            </div>
            <div className="pp-price">
              <span className={`price-now ${d ? "is-deal" : ""}`}>{price(p.price)}</span>
              {d > 0 && p.old && (
                <>
                  <span className="price-old">{price(p.old)}</span>
                  <span className="pp-save">Економія {price(p.old - p.price)}</span>
                </>
              )}
            </div>
            <BuyBox c={c} />
            <ul className="pp-lines">
              <li>
                <Icon name="truck" size={18} />
                <span>
                  <b>{delivery.map((x) => x.title).join(", ")}.</b> Відправка по всій Україні за тарифами перевізника.
                </span>
              </li>
              <li>
                <Icon name="card" size={18} />
                <span>Накладений платіж або переказ на картку. Онлайн-оплата на сайті не потрібна.</span>
              </li>
              <li>
                <Icon name="shield" size={18} />
                <span>Оригінальна продукція LIVESTA за ціною каталогу.</span>
              </li>
            </ul>
            <div className="acc">
              {p.desc.length > 0 && (
                <details open>
                  <summary>
                    Опис <Icon name="plus" size={18} />
                  </summary>
                  <div className="acc-body">
                    {p.desc.map((t, i) => (
                      <p key={i}>{t}</p>
                    ))}
                  </div>
                </details>
              )}
              {extra.map(([k, v]) => (
                <details key={k}>
                  <summary>
                    {MORE_TITLES[k]} <Icon name="plus" size={18} />
                  </summary>
                  <div className="acc-body">
                    {v.map((t, i) => (
                      <p key={i}>{t}</p>
                    ))}
                  </div>
                </details>
              ))}
              <details>
                <summary>
                  Доставка й оплата <Icon name="plus" size={18} />
                </summary>
                <div className="acc-body">
                  {delivery.map((x) => (
                    <p key={x.id}>
                      <b>{x.title}.</b> {x.note}
                    </p>
                  ))}
                  {payment.map((x) => (
                    <p key={x.id}>
                      <b>{x.title}.</b> {x.note}
                    </p>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {rel.length > 0 && (
        <section className="sec sec-nude">
          <div className="wrap sec-head">
            <div>
              <p className="eyebrow">{series ? `Серія ${series.name}` : "Вам також сподобається"}</p>
              <h2 className="display-md">
                Доповніть <em>ритуал</em>
              </h2>
            </div>
          </div>
          <div className="hscroll">
            {rel.map((r) => (
              <ProductCard key={r.id} c={r} />
            ))}
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
