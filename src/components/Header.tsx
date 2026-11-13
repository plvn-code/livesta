"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { img } from "@/lib/format";
import { site } from "@/lib/site";
import { Icon, SocialIcon } from "./Icons";
import { Logo } from "./Shared";

type MenuSection = { id: string; name: string; count: number; subs: { id: string; name: string }[]; art?: string };

export const openSearch = (q?: string) => window.dispatchEvent(new CustomEvent("open-search", { detail: { q } }));

const ANNOUNCE = [
  `Ціни каталогу LIVESTA ${site.catalogue.from} — ${site.catalogue.to}`,
  "Відправка по всій Україні",
  "Безкоштовна консультація з підбору догляду",
  "Подарункове пакування на прохання",
  "Оптова співпраця для салонів",
];

export function Header({ sections }: { sections: MenuSection[] }) {
  const pathname = usePathname();
  const { count, setOpen, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [active, setActive] = useState(sections[0]?.id);
  const [menu, setMenu] = useState(false);
  const closeT = useRef(0);

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setScrolled(y > 20);
        setHidden(y > 400 && y > last + 4 ? true : y < last - 4 ? false : (h) => h);
        last = y;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMega(false);
    setMenu(false);
  }, [pathname]);
  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menu);
  }, [menu]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape") {
        setMega(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMega = () => {
    window.clearTimeout(closeT.current);
    setMega(true);
  };
  const closeMega = () => {
    closeT.current = window.setTimeout(() => setMega(false), 180);
  };
  const cur = sections.find((s) => s.id === active) ?? sections[0];
  const badge = ready && count > 0 ? <span className="pill">{count}</span> : null;

  return (
    <>
      <div className="announce" role="note">
        <div className="announce-track">
          {[...ANNOUNCE, ...ANNOUNCE].map((t, i) => (
            <span key={i} aria-hidden={i >= ANNOUNCE.length}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <header className={`hdr ${scrolled ? "is-scrolled" : ""} ${hidden && !mega && !menu ? "is-hidden" : ""} ${mega || menu ? "is-menu" : ""}`} onMouseLeave={closeMega}>
        <div className="wrap hdr-in">
          <nav className="hdr-nav" aria-label="Головне меню">
            <button type="button" className={pathname.startsWith("/katalog") ? "is-on" : ""} onMouseEnter={openMega} onFocus={openMega} onClick={() => setMega((v) => !v)} aria-expanded={mega} aria-controls="mega">
              Каталог
            </button>
            <Link href="/katalog?deal=1" className="deal" onMouseEnter={closeMega}>
              Крута ціна
            </Link>
            <Link href="/katalog/oblychchia" className="hide-md" onMouseEnter={closeMega}>
              Обличчя
            </Link>
            <Link href="/dostavka" className={`hide-md ${pathname === "/dostavka" ? "is-on" : ""}`} onMouseEnter={closeMega}>
              Доставка
            </Link>
          </nav>
          <button type="button" className="icon-btn burger" onClick={() => setMenu((v) => !v)} aria-label={menu ? "Закрити меню" : "Відкрити меню"} aria-expanded={menu}>
            <Icon name={menu ? "close" : "menu"} size={22} />
          </button>
          <Link href="/" aria-label="Livesta One — на головну">
            <Logo />
          </Link>
          <div className="hdr-actions">
            <button type="button" className="search-trigger" onClick={() => openSearch()} aria-label="Пошук">
              <Icon name="search" size={18} />
              <span>Пошук</span>
              <kbd>⌘K</kbd>
            </button>
            <Link href="/kontakty" className="icon-btn hide-sm" aria-label="Контакти">
              <Icon name="user" size={20} />
            </Link>
            <button type="button" className="icon-btn cart-btn" data-cart-target onClick={() => setOpen(true)} aria-label={`Кошик${count ? `, ${count}` : ""}`}>
              <Icon name="bag" size={21} />
              {badge}
            </button>
          </div>
        </div>

        <div id="mega" className={`mega ${mega ? "is-open" : ""}`} onMouseEnter={openMega} inert={!mega}>
          <div className="wrap mega-in">
            <ul className="mega-secs">
              {sections.map((s) => (
                <li key={s.id}>
                  <Link href={`/katalog/${s.id}`} className={s.id === cur?.id ? "is-on" : ""} onMouseEnter={() => setActive(s.id)} onFocus={() => setActive(s.id)}>
                    {s.name} <small>{s.count}</small>
                  </Link>
                </li>
              ))}
            </ul>
            {cur && (
              <div className="mega-subs" key={cur.id}>
                <Link href={`/katalog/${cur.id}`} className="mega-all">
                  Усе в розділі «{cur.name}» →
                </Link>
                {cur.subs.slice(0, 16).map((sub) => (
                  <Link key={sub.id} href={`/katalog/${cur.id}?sub=${sub.id}`}>
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
            <div className="mega-art" aria-hidden="true">
              {cur?.art && <img key={cur.art} src={img(cur.art, "c")} alt="" />}
              <p>Ціни чинного каталогу LIVESTA · {site.catalogue.from}–{site.catalogue.to}</p>
            </div>
          </div>
        </div>
      </header>

      <nav className={`mnav ${menu ? "is-open" : ""}`} aria-label="Мобільне меню" inert={!menu}>
        <ul className="mnav-list">
          <li>
            <Link href="/katalog?deal=1">
              <span className="it" style={{ color: "var(--rose-deep)" }}>
                Крута ціна
              </span>
            </Link>
          </li>
          {sections.map((s) => (
            <li key={s.id}>
              <Link href={`/katalog/${s.id}`}>
                {s.name} <small>{s.count}</small>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mnav-links">
          <Link href="/katalog">Увесь каталог</Link>
          <Link href="/dostavka">Доставка й оплата</Link>
          <Link href="/kontakty">Контакти та опт</Link>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer">
            <SocialIcon name="Instagram" /> Instagram {site.handle}
          </a>
          <a href={site.telegram} target="_blank" rel="noopener noreferrer">
            <SocialIcon name="Telegram" /> Telegram-канал
          </a>
        </div>
      </nav>
    </>
  );
}
