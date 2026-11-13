"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Card, img, price } from "@/lib/format";
import { reducedMotion, useScrollProgress } from "@/lib/motion";
import { Icon } from "../Icons";
import { ProductCard } from "../ProductCard";

/** Muted looping clip that only plays while on screen (and never with reduced motion: the poster stays). */
export function Clip({ src, mobile, poster, className }: { src: string; mobile?: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || reducedMotion()) return;
    const want = mobile && window.matchMedia("(max-width: 760px)").matches ? mobile : src;
    if (!v.src.endsWith(want)) v.src = want;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.05 });
    io.observe(v);
    return () => io.disconnect();
  }, [src, mobile]);
  return <video ref={ref} className={className} poster={poster} muted loop playsInline preload="none" aria-hidden="true" />;
}

/** Sticky hero: the video recedes into a rounded card, the copy lifts away, floating products drift up and a line of text takes over. */
export function Hero({ children, floats }: { children: React.ReactNode; floats: string[] }) {
  const root = useRef<HTMLElement>(null);
  useScrollProgress(root, (p) => root.current?.style.setProperty("--p", p.toFixed(3)));
  // The header sits transparent over the hero only on pages that have one.
  useEffect(() => {
    document.documentElement.classList.add("has-hero");
    return () => document.documentElement.classList.remove("has-hero");
  }, []);
  return (
    <section className="hero" ref={root}>
      <div className="hero-stick">
        <div className="hero-media">
          <Clip src="/video/hero.mp4" mobile="/video/hero-mobile.mp4" poster="/images/hero-poster.webp" />
        </div>
        <div className="hero-floats" aria-hidden="true">
          {floats.map((id, i) => (
            <div className="hero-float" key={id} style={{ ["--fd" as string]: `${i * -2.1}s` }}>
              <img src={img(id, "c")} alt="" />
            </div>
          ))}
        </div>
        <div className="hero-copy">
          <div className="wrap">{children}</div>
        </div>
        <div className="hero-next" aria-hidden="true">
          <p>
            Догляд, у який <em>закохуються</em> з першого нанесення
          </p>
        </div>
        <div className="hero-scroll" aria-hidden="true">
          Гортайте
          <i />
        </div>
      </div>
    </section>
  );
}

/** Pinned horizontal rail on desktop; a swipeable row on touch / narrow screens / reduced motion. */
export function Rail({ cards, head, href, more }: { cards: Card[]; head: React.ReactNode; href: string; more: string }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    const mq = window.matchMedia("(min-width: 961px) and (hover: hover)");
    let raf = 0;
    let dist = 0;
    const update = () => {
      raf = 0;
      if (!dist) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      tr.style.setProperty("--x", `${(-p * dist).toFixed(1)}px`);
      el.style.setProperty("--rp", p.toFixed(3));
    };
    const measure = () => {
      const on = mq.matches && !reducedMotion();
      setPinned(on);
      if (!on) {
        el.style.height = "";
        tr.style.removeProperty("--x");
        dist = 0;
        return;
      }
      dist = Math.max(0, tr.scrollWidth - window.innerWidth);
      el.style.height = `${window.innerHeight + dist}px`;
      update();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(tr);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", measure);
    };
  }, []);

  const items = (
    <>
      {cards.map((c, i) => (
        <div key={c.id}>
          <ProductCard c={c} eager={i < 2} />
        </div>
      ))}
      <Link href={href} className="rail-end" data-cursor="Усі">
        <b>{more}</b>
        <span className="btn btn-light btn-sm">
          Дивитись <Icon name="arrow" size={16} />
        </span>
      </Link>
    </>
  );

  return (
    <section className={`rail sec-nude ${pinned ? "" : "sec"}`} ref={root}>
      <div className={pinned ? "rail-stick" : ""}>
        <div className="rail-head">{head}</div>
        {pinned ? (
          <div className="rail-track" ref={track}>
            {items}
          </div>
        ) : (
          <div className="hscroll" ref={track}>
            {items}
          </div>
        )}
        {pinned && (
          <div className="rail-progress" aria-hidden="true">
            <i />
          </div>
        )}
      </div>
    </section>
  );
}

/** Words light up one by one while the section is pinned; cut-out products drift past. */
export function Manifest({ text, accent, art }: { text: string; accent: string[]; art: string[] }) {
  const root = useRef<HTMLElement>(null);
  const words = text.split(" ");
  const acc = new Set(accent);
  useScrollProgress(root, (p) => {
    const el = root.current;
    if (!el) return;
    const lit = Math.round(Math.min(1, p * 1.25) * words.length);
    el.querySelectorAll<HTMLElement>(".w").forEach((w, i) => w.classList.toggle("on", i < lit));
  });
  const spots = [
    { left: "6%", top: "14%", rot: "-10deg", sp: 0.18 },
    { right: "7%", top: "8%", rot: "8deg", sp: 0.32 },
    { left: "12%", bottom: "6%", rot: "6deg", sp: 0.42 },
    { right: "10%", bottom: "10%", rot: "-6deg", sp: 0.24 },
  ];
  return (
    <section className="manifest sec-blush" ref={root}>
      <div className="manifest-stick">
        {art.slice(0, 4).map((id, i) => (
          <img
            key={id}
            className="manifest-img"
            src={img(id, "c")}
            alt=""
            aria-hidden="true"
            loading="lazy"
            data-parallax={spots[i].sp}
            style={{ ...spots[i], ["--rot" as string]: spots[i].rot }}
          />
        ))}
        <p>
          {words.map((w, i) => (
            <span key={i} className={`w ${acc.has(w) ? "em" : ""}`}>
              {w}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

export type Step = { title: string; text: string; cards: Card[] };

/** A 4-step routine: sticky video on the left, the step nearest the middle of the screen lights up. */
export function Ritual({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const els = list.current?.querySelectorAll<HTMLElement>(".step");
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <div className="ritual">
      <div className="ritual-media">
        <Clip src="/video/ritual.mp4" poster="/images/ritual-poster.webp" />
        <span className="ritual-count" aria-hidden="true">
          0{active + 1}
        </span>
      </div>
      <div className="ritual-steps" ref={list}>
        {steps.map((s, i) => (
          <article key={s.title} className={`step ${i === active ? "is-active" : ""}`} data-i={i}>
            <p className="step-n">Крок {i + 1}</p>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <div className="step-products">
              {s.cards.map((c) => (
                <Link key={c.id} href={`/tovar/${c.s}`} className="mini">
                  <img src={img(c.id, "s")} alt="" loading="lazy" />
                  <span>
                    {c.n}
                    <b>{price(c.p)}</b>
                  </span>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export type SeriesItem = { id: string; name: string; count: number; art: string[]; line: string };

const TINTS = ["t-blush", "t-nude", "t-sand", "t-rose", "t-nude", "t-blush"];

/**
 * Series as accordion panels: narrow tinted columns with a vertical name; the active one opens wide and its products float in.
 * Opens on hover / focus / tap; while on screen and untouched it advances by itself every 4.5 s.
 * Phones get a swipeable row of open cards instead.
 */
export function SeriesWall({ items }: { items: SeriesItem[] }) {
  const [cur, setCur] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const hold = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const t = window.setInterval(() => {
      if (visible && !hold.current && document.visibilityState === "visible") setCur((c) => (c + 1) % items.length);
    }, 4500);
    return () => {
      io.disconnect();
      window.clearInterval(t);
    };
  }, [items.length]);

  return (
    <div className="sx" ref={root} onPointerEnter={() => (hold.current = true)} onPointerLeave={() => (hold.current = false)}>
      {items.map((s, i) => (
        <article
          key={s.id}
          className={`sx-item ${TINTS[i % TINTS.length]} ${i === cur ? "is-on" : ""}`}
          onPointerEnter={(e) => e.pointerType === "mouse" && setCur(i)}
          onFocusCapture={() => setCur(i)}
          onClick={() => setCur(i)}
        >
          <span className="sx-n">{String(i + 1).padStart(2, "0")}</span>
          <span className="sx-v" aria-hidden="true">
            {s.name}
          </span>
          <div className="sx-art" aria-hidden="true">
            {s.art.map((id, k) => (
              <img key={id} src={img(id, "c")} alt="" loading="lazy" style={{ ["--k" as string]: k }} />
            ))}
          </div>
          <div className="sx-body">
            <p className="sx-line">{s.line}</p>
            <h3 className="sx-name">{s.name}</h3>
            <Link href={`/katalog?brand=${s.id}`} className="btn btn-sm" tabIndex={i === cur ? 0 : -1}>
              {s.count} позицій <Icon name="arrow" size={16} />
            </Link>
          </div>
          <span className="sx-bar" aria-hidden="true" />
        </article>
      ))}
    </div>
  );
}

/** Days / hours / minutes left until the catalogue prices end. Renders the server value first, then ticks. */
export function Countdown({ until }: { until: string }) {
  const end = new Date(until).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  const left = Math.max(0, end - (now ?? end));
  const d = Math.floor(left / 86_400_000);
  const h = Math.floor((left % 86_400_000) / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="countdown" role="timer" aria-label={`До кінця каталогу: ${d} днів ${h} годин`}>
      <div>
        <b>{now === null ? "··" : pad(d)}</b>
        <small>днів</small>
      </div>
      <div>
        <b>{now === null ? "··" : pad(h)}</b>
        <small>годин</small>
      </div>
      <div>
        <b>{now === null ? "··" : pad(m)}</b>
        <small>хвилин</small>
      </div>
    </div>
  );
}
