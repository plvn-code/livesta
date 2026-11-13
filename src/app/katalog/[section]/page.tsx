import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";
import { PageHero } from "@/components/Shared";
import { getSection, products, sections, seriesList, toCard } from "@/lib/catalog";
import { goods } from "@/lib/format";

export const dynamicParams = false;
export const generateStaticParams = () => sections.map((s) => ({ section: s.id }));

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const s = getSection((await params).section);
  if (!s) return {};
  return {
    title: `${s.name} — косметика LIVESTA`,
    description: `${s.lead} ${goods(s.count)} у Livesta One, відправка по всій Україні.`,
    alternates: { canonical: `/katalog/${s.id}` },
  };
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const s = getSection((await params).section);
  if (!s) notFound();
  const list = products.filter((p) => p.section === s.id);
  return (
    <>
      <PageHero eyebrow={goods(s.count)} title={s.name} lead={s.lead} crumbs={[{ href: "/", label: "Головна" }, { href: "/katalog", label: "Каталог" }, { label: s.name }]}>
        <nav className="chips-scroll" aria-label="Інші розділи" style={{ marginTop: 28 }}>
          {sections
            .filter((x) => x.id !== s.id)
            .map((x) => (
              <Link key={x.id} href={`/katalog/${x.id}`} className="chip chip-sm">
                {x.name}
              </Link>
            ))}
        </nav>
      </PageHero>
      <section className="catalog">
        <div className="wrap">
          <Suspense fallback={<div className="grid-skeleton" />}>
            <Catalog cards={list.map(toCard)} subs={s.subs} brands={seriesList.map(({ id, name }) => ({ id, name }))} fixed="section" />
          </Suspense>
        </div>
      </section>
    </>
  );
}
