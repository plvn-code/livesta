"use client";

import { useState } from "react";
import { type Card, img, off } from "@/lib/format";
import { CallbackButton } from "./Callback";
import { Icon } from "./Icons";
import { AddToCart } from "./ProductCard";

/** Product photos on white: thumbnails + a stage with a 2× zoom that follows the pointer. */
export function Gallery({ id, count, name, discount }: { id: string; count: number; name: string; discount: number }) {
  const srcs = Array.from({ length: Math.max(1, count) }, (_, i) => (i === 0 ? img(id) : `/images/p/${id}-${i}.webp`));
  const [cur, setCur] = useState(0);
  const [zoom, setZoom] = useState(false);
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <div className={`pp-gallery ${srcs.length < 2 ? "is-single" : ""}`}>
      {srcs.length > 1 && (
        <div className="pp-thumbs" role="tablist" aria-label="Фото товару">
          {srcs.map((s, i) => (
            <button key={s} type="button" role="tab" aria-selected={i === cur} className={i === cur ? "is-on" : ""} onClick={() => setCur(i)} aria-label={`Фото ${i + 1}`}>
              <img src={s} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div
        className={`pp-stage ${zoom ? "is-zoom" : ""}`}
        onPointerMove={move}
        onPointerEnter={(e) => e.pointerType === "mouse" && setZoom(true)}
        onPointerLeave={() => setZoom(false)}
        onClick={() => setZoom((z) => !z)}
      >
        {count > 0 ? <img src={srcs[cur]} alt={name} fetchPriority="high" width={900} height={900} /> : null}
        {discount > 0 && (
          <div className="pc-badges">
            <span className="badge">−{discount}%</span>
            <span className="badge badge-ink">Крута ціна</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function BuyBox({ c }: { c: Card }) {
  return (
    <>
      <div className="pp-buy">
        <AddToCart c={c} label="Додати в кошик" />
        <CallbackButton kind="oneclick" product={`${c.n}${c.v ? `, ${c.v}` : ""} (код ${c.id})`} className="btn btn-outline">
          В один клік
        </CallbackButton>
      </div>
      {off(c.p, c.o) > 0 && (
        <p className="muted" style={{ fontSize: 13 }}>
          <Icon name="clock" size={14} /> Ціна «Крута ціна» діє до кінця каталогу.
        </p>
      )}
    </>
  );
}
