"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { openCallback } from "./Callback";
import { openSearch } from "./Header";
import { Icon } from "./Icons";

/** Logo letters rise, then the blush curtain lifts. CSS only; skipped by an inline script after the first visit / off the home page. */
export function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-word">
        {"LIVESTA".split("").map((ch, i) => (
          <span key={i} style={{ ["--i" as string]: i }}>
            {ch}
          </span>
        ))}
      </div>
      <p className="intro-sub">one · beauty store</p>
    </div>
  );
}

/** Thumb-reach bar on phones: catalogue, search, consultation, cart. Hides while scrolling down. */
export function MobileBar() {
  const { count, setOpen, ready } = useCart();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) > 6) setHidden(y > last && y > 300);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (pathname === "/koshyk") return null;
  return (
    <nav className={`mbar ${hidden ? "is-hidden" : ""}`} aria-label="Швидкі дії">
      <Link href="/katalog">
        <Icon name="grid" size={20} />
        Каталог
      </Link>
      <button type="button" onClick={() => openSearch()}>
        <Icon name="search" size={20} />
        Пошук
      </button>
      <button type="button" onClick={() => openCallback("consult")}>
        <Icon name="chat" size={20} />
        Порада
      </button>
      <button type="button" onClick={() => setOpen(true)} data-cart-target>
        <Icon name="bag" size={20} />
        Кошик
        {ready && count > 0 && <span className="pill">{count}</span>}
      </button>
    </nav>
  );
}
