import type { MetadataRoute } from "next";
import { products, sections } from "@/lib/catalog";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/katalog", "/dostavka", "/kontakty"].map((p) => ({ url: `${site.url}${p}`, priority: p ? 0.8 : 1 }));
  return [
    ...pages,
    ...sections.map((s) => ({ url: `${site.url}/katalog/${s.id}`, priority: 0.8 })),
    ...products.map((p) => ({ url: `${site.url}/tovar/${p.slug}`, priority: 0.6 })),
  ];
}
