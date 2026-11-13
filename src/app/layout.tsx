import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { CallbackModal } from "@/components/Callback";
import { CartDrawer } from "@/components/CartDrawer";
import { Intro, MobileBar } from "@/components/Chrome";
import { CursorLabel } from "@/components/CursorLabel";
import { Effects } from "@/components/Effects";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SearchOverlay } from "@/components/SearchOverlay";
import { products, sections } from "@/lib/catalog";
import { CartProvider } from "@/lib/cart";
import { site } from "@/lib/site";
import "./fonts.css";
import "./globals.css";

const body = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Livesta One — доглядова косметика LIVESTA з доставкою по Україні", template: "%s — Livesta One" },
  description: site.description,
  openGraph: { type: "website", locale: "uk_UA", siteName: "Livesta One", images: ["/images/hero-poster.webp"] },
  // Stays out of search until the client approves the launch.
  robots: process.env.NEXT_PUBLIC_SITE_LIVE === "1" ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#fbf7f4", colorScheme: "light" };

/** Cut-out shown in the mega menu next to each section: the first product of the section that has a clean cut-out. */
const art = (id: string) => products.find((p) => p.section === id && p.cut)?.id;

const store = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Livesta One",
  url: site.url,
  address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: "UA" },
  sameAs: [site.instagram, site.telegram],
};

/** Runs before paint: the intro shows once per session, only on the home page, never with reduced motion. */
const introScript = `try{var d=document.documentElement;if(sessionStorage.getItem('lv-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches||location.pathname!=='/'){d.classList.add('no-intro')}sessionStorage.setItem('lv-intro','1')}catch(e){document.documentElement.classList.add('no-intro')}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const menu = sections.map((s) => ({ id: s.id, name: s.name, count: s.count, subs: s.subs.map(({ id, name }) => ({ id, name })), art: art(s.id) }));
  return (
    <html lang="uk" data-scroll-behavior="smooth" className={body.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Перейти до змісту
        </a>
        <CartProvider>
          <Intro />
          <Header sections={menu} />
          <main id="main">{children}</main>
          <Footer />
          <MobileBar />
          <SearchOverlay />
          <CartDrawer />
          <CallbackModal />
        </CartProvider>
        <CursorLabel />
        <Effects />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(store) }} />
      </body>
    </html>
  );
}
