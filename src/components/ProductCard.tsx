"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { type Card, img, off, price } from "@/lib/format";
import { Icon } from "./Icons";

/** Add-to-cart that turns into a quantity stepper once the product is in the cart. */
export function AddToCart({ c, label = "У кошик" }: { c: Card; label?: string }) {
  const { add, qtyOf, setQty, ready } = useCart();
  const q = ready ? qtyOf(c.id) : 0;
  if (q)
    return (
      <div className="stepper" role="group" aria-label={`Кількість: ${c.n}`}>
        <button type="button" onClick={() => setQty(c.id, q - 1)} aria-label="Менше">
          <Icon name="minus" size={16} />
        </button>
        <output aria-live="polite">{q}</output>
        <button type="button" onClick={(e) => add(c, 1, e.currentTarget)} aria-label="Більше">
          <Icon name="plus" size={16} />
        </button>
      </div>
    );
  return (
    <button type="button" className="btn" onClick={(e) => add(c, 1, e.currentTarget)}>
      <Icon name="bag" size={16} /> {label}
    </button>
  );
}

export function ProductCard({ c, eager }: { c: Card; eager?: boolean }) {
  const { add, qtyOf, ready } = useCart();
  const d = off(c.p, c.o);
  const inCart = ready && qtyOf(c.id) > 0;
  return (
    <article className="pc">
      <div className="pc-media" data-cursor="Дивитись">
        <Link href={`/tovar/${c.s}`} tabIndex={-1} aria-hidden="true">
          {c.img ? <img src={img(c.id, "s")} alt="" loading={eager ? "eager" : "lazy"} decoding="async" width={420} height={420} /> : null}
        </Link>
        {d > 0 && (
          <div className="pc-badges">
            <span className="badge">−{d}%</span>
          </div>
        )}
        <div className="pc-add">
          <AddToCart c={c} />
        </div>
        <button type="button" className={`pc-add-mobile ${inCart ? "is-in" : ""}`} onClick={(e) => add(c, 1, e.currentTarget)} aria-label={`У кошик: ${c.n}`}>
          <Icon name={inCart ? "check" : "plus"} size={18} stroke={2} />
        </button>
      </div>
      <div className="pc-body">
        {c.srn && <p className="pc-series">{c.srn}</p>}
        <h3 className="pc-name">
          <Link href={`/tovar/${c.s}`}>{c.n}</Link>
        </h3>
        {c.v && <p className="pc-vol">{c.v}</p>}
        <p className="pc-price">
          <span className={`price-now ${d ? "is-deal" : ""}`}>{price(c.p)}</span>
          {d > 0 && c.o && <span className="price-old">{price(c.o)}</span>}
        </p>
      </div>
    </article>
  );
}
