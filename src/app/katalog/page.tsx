import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";
import { PageHero } from "@/components/Shared";
import { allCards, products, sections, seriesList } from "@/lib/catalog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Каталог косметики LIVESTA",
  description: `${products.length} засобів LIVESTA: догляд за обличчям, волоссям і тілом, парфумерія, макіяж, краса зсередини. Ціни каталогу ${site.catalogue.from}–${site.catalogue.to}, відправка по всій Україні.`,
  alternates: { canonical: "/katalog" },
};

export default function Katalog() {
  return (
    <>
      <PageHero
        eyebrow={`Каталог ${site.catalogue.from} — ${site.catalogue.to}`}
        title={"Увесь *догляд* LIVESTA"}
        lead={`${products.length} засобів за цінами чинного каталогу. Фільтруйте за розділом, серією та ціною — або просто почніть вводити назву чи код.`}
        crumbs={[{ href: "/", label: "Головна" }, { label: "Каталог" }]}
      />
      <section className="catalog">
        <div className="wrap">
          <Suspense fallback={<div className="grid-skeleton" />}>
            <Catalog cards={allCards()} sections={sections.map(({ id, name, count }) => ({ id, name, count }))} brands={seriesList.map(({ id, name }) => ({ id, name }))} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
