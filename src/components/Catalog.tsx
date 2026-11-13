"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { type Card, goods, off, searchCards } from "@/lib/format";
import { Icon } from "./Icons";
import { ProductCard } from "./ProductCard";

type Opt = { id: string; name: string; count?: number };
type Sort = "pop" | "asc" | "desc" | "name" | "deal";
const PAGE = 24;
const PRICES = [
  { id: "0-200", label: "до 200 ₴", min: 0, max: 200 },
  { id: "200-400", label: "200–400 ₴", min: 200, max: 400 },
  { id: "400-800", label: "400–800 ₴", min: 400, max: 800 },
  { id: "800-", label: "від 800 ₴", min: 800, max: Infinity },
];

/**
 * The catalogue grid with every filter in the URL (?sec ?sub ?brand=<series> ?price ?deal ?q ?sort), so a filtered view can be shared or bookmarked.
 * `fixed` pins the section (on /katalog/[section]).
 */
export function Catalog({ cards, sections, subs, brands, fixed }: { cards: Card[]; sections?: Opt[]; subs?: Opt[]; brands: Opt[]; fixed?: "section" }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sec = params.get("sec") ?? "";
  const sub = params.get("sub") ?? "";
  const brandSel = useMemo(() => (params.get("brand") ?? "").split(",").filter(Boolean), [params]);
  const pr = PRICES.find((p) => p.id === params.get("price"));
  const q = params.get("q") ?? "";
  const deal = params.get("deal") === "1";
  const sort = (params.get("sort") as Sort) || "pop";
  const [shown, setShown] = useState(PAGE);
  const [sheet, setSheet] = useState(false);
  const [allBrands, setAllBrands] = useState(false);
  const [allSubs, setAllSubs] = useState(false);
  const [query, setQuery] = useState(q);

  useEffect(() => setQuery(q), [q]);
  useEffect(() => {
    document.documentElement.classList.toggle("sheet-open", sheet);
  }, [sheet]);

  const set = (patch: Record<string, string | null>) => {
    const u = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) u.set(k, v);
      else u.delete(k);
    }
    setShown(PAGE);
    router.replace(`${pathname}${u.size ? `?${u}` : ""}`, { scroll: false });
  };

  // Debounced search-as-you-type within the catalogue.
  useEffect(() => {
    if (query === q) return;
    const t = window.setTimeout(() => set({ q: query.trim() || null }), 280);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const base = useMemo(() => {
    let l = q ? searchCards(cards, q, 2000) : cards;
    if (sec) l = l.filter((c) => c.sec === sec);
    if (sub) l = l.filter((c) => c.sub === sub);
    if (pr) l = l.filter((c) => c.p >= pr.min && c.p < pr.max);
    if (deal) l = l.filter((c) => off(c.p, c.o) >= 20);
    return l;
  }, [cards, q, sec, sub, pr, deal]);

  // Brand counts reflect every other active filter.
  const brandCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of base) if (c.sr) m.set(c.sr, (m.get(c.sr) ?? 0) + 1);
    return m;
  }, [base]);

  const list = useMemo(() => {
    let l = brandSel.length ? base.filter((c) => c.sr && brandSel.includes(c.sr)) : base;
    if (sort === "asc" || sort === "desc") {
      const priced = l.filter((c) => c.p).sort((a, b) => (sort === "asc" ? a.p - b.p : b.p - a.p));
      l = [...priced, ...l.filter((c) => !c.p)];
    } else if (sort === "name") {
      l = [...l].sort((a, b) => a.n.localeCompare(b.n, "uk"));
    } else if (sort === "deal") {
      l = [...l].sort((a, b) => off(b.p, b.o) - off(a.p, a.o));
    } else if (!q) {
      l = [...l].sort((a, b) => Number(b.img) - Number(a.img));
    }
    return l;
  }, [base, brandSel, sort, q]);

  const brandOpts = brands.filter((b) => brandCounts.get(b.id) || brandSel.includes(b.id)).sort((a, b) => (brandCounts.get(b.id) ?? 0) - (brandCounts.get(a.id) ?? 0));
  const visibleBrands = allBrands ? brandOpts : brandOpts.slice(0, 10);
  const toggleBrand = (id: string) => set({ brand: (brandSel.includes(id) ? brandSel.filter((b) => b !== id) : [...brandSel, id]).join(",") || null });
  const subOpts = subs ?? [];

  const active: { label: string; clear: () => void }[] = [
    ...(sec && sections ? [{ label: sections.find((s) => s.id === sec)?.name ?? sec, clear: () => set({ sec: null, sub: null }) }] : []),
    ...(sub ? [{ label: subOpts.find((s) => s.id === sub)?.name ?? sub, clear: () => set({ sub: null }) }] : []),
    ...brandSel.map((b) => ({ label: brands.find((x) => x.id === b)?.name ?? b, clear: () => toggleBrand(b) })),
    ...(pr ? [{ label: pr.label, clear: () => set({ price: null }) }] : []),
    ...(deal ? [{ label: "Крута ціна", clear: () => set({ deal: null }) }] : []),
    ...(q ? [{ label: `«${q}»`, clear: () => set({ q: null }) }] : []),
  ];
  const resetAll = () => {
    setQuery("");
    router.replace(pathname, { scroll: false });
    setShown(PAGE);
  };

  const filters = (
    <>
      {sections && fixed !== "section" && (
        <div className="fgroup">
          <p className="fgroup-h">Розділ</p>
          <ul className="flist">
            <li>
              <button type="button" className={!sec ? "is-on" : ""} onClick={() => set({ sec: null, sub: null })}>
                Усі товари
              </button>
            </li>
            {sections.map((s) => (
              <li key={s.id}>
                <button type="button" className={sec === s.id ? "is-on" : ""} onClick={() => set({ sec: s.id, sub: null })}>
                  {s.name} <small>{s.count}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {fixed === "section" && subOpts.length > 1 && (
        <div className="fgroup">
          <p className="fgroup-h">Категорія</p>
          <ul className="flist">
            <li>
              <button type="button" className={!sub ? "is-on" : ""} onClick={() => set({ sub: null })}>
                Усі
              </button>
            </li>
            {(allSubs ? subOpts : subOpts.slice(0, 8)).concat(!allSubs && sub && subOpts.findIndex((x) => x.id === sub) >= 8 ? subOpts.filter((x) => x.id === sub) : []).map((s) => (
              <li key={s.id}>
                <button type="button" className={sub === s.id ? "is-on" : ""} onClick={() => set({ sub: s.id })}>
                  {s.name} <small>{s.count}</small>
                </button>
              </li>
            ))}
          </ul>
          {subOpts.length > 8 && (
            <button type="button" className="link-btn" onClick={() => setAllSubs((v) => !v)}>
              {allSubs ? "Згорнути" : `Показати всі (${subOpts.length})`}
            </button>
          )}
        </div>
      )}
      <div className="fgroup">
        <label className="check">
          <input type="checkbox" checked={deal} onChange={() => set({ deal: deal ? null : "1" })} />
          <span className="check-box" aria-hidden="true">
            <Icon name="check" size={13} stroke={2.4} />
          </span>
          Лише «Крута ціна» <small>−20% і більше</small>
        </label>
      </div>
      <div className="fgroup">
        <p className="fgroup-h">Ціна</p>
        <div className="fprices">
          {PRICES.map((p) => (
            <button key={p.id} type="button" className={`chip chip-sm ${pr?.id === p.id ? "is-on" : ""}`} onClick={() => set({ price: pr?.id === p.id ? null : p.id })}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {brandOpts.length > 1 && (
        <div className="fgroup">
          <p className="fgroup-h">Серія</p>
          <ul className="fchecks">
            {visibleBrands.map((b) => (
              <li key={b.id}>
                <label className="check">
                  <input type="checkbox" checked={brandSel.includes(b.id)} onChange={() => toggleBrand(b.id)} />
                  <span className="check-box" aria-hidden="true">
                    <Icon name="check" size={13} stroke={2.4} />
                  </span>
                  {b.name}
                  <small>{brandCounts.get(b.id) ?? 0}</small>
                </label>
              </li>
            ))}
          </ul>
          {brandOpts.length > 10 && (
            <button type="button" className="link-btn" onClick={() => setAllBrands((v) => !v)}>
              {allBrands ? "Згорнути" : `Показати всі (${brandOpts.length})`}
            </button>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="catalog">
      {fixed === "section" && subOpts.length > 1 && (
        <div className="chips chips-scroll" role="tablist" aria-label="Категорії">
          <button type="button" role="tab" aria-selected={!sub} className={`chip ${!sub ? "is-on" : ""}`} onClick={() => set({ sub: null })}>
            Усі <small>{cards.length}</small>
          </button>
          {subOpts.map((s) => (
            <button key={s.id} type="button" role="tab" aria-selected={sub === s.id} className={`chip ${sub === s.id ? "is-on" : ""}`} onClick={() => set({ sub: s.id })}>
              {s.name} <small>{s.count}</small>
            </button>
          ))}
        </div>
      )}

      <div className="catalog-bar">
        <label className="catalog-search">
          <Icon name="search" size={18} />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Пошук у каталозі" aria-label="Пошук у каталозі" enterKeyHint="search" />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Очистити">
              <Icon name="close" size={16} />
            </button>
          )}
        </label>
        <button type="button" className="btn btn-outline catalog-filter-btn" onClick={() => setSheet(true)}>
          <Icon name="filter" size={18} /> Фільтри {active.length > 0 && <small className="pill">{active.length}</small>}
        </button>
        <label className="select">
          <span className="sr-only">Сортування</span>
          <select value={sort} onChange={(e) => set({ sort: e.target.value === "pop" ? null : e.target.value })}>
            <option value="pop">Рекомендовані</option>
            <option value="deal">Найбільша знижка</option>
            <option value="asc">Дешевші</option>
            <option value="desc">Дорожчі</option>
            <option value="name">За назвою</option>
          </select>
          <Icon name="chevron" size={16} />
        </label>
      </div>

      <div className="catalog-layout">
        <aside className="catalog-side" aria-label="Фільтри">
          {filters}
        </aside>

        <div className="catalog-main">
          <div className="catalog-meta">
            <p aria-live="polite">
              <b>{goods(list.length)}</b>
            </p>
            {active.length > 0 && (
              <div className="active-filters">
                {active.map((a) => (
                  <button key={a.label} type="button" className="chip chip-sm is-on" onClick={a.clear}>
                    {a.label} <Icon name="close" size={13} />
                  </button>
                ))}
                <button type="button" className="link-btn" onClick={resetAll}>
                  Скинути все
                </button>
              </div>
            )}
          </div>

          {list.length ? (
            <div className="grid">
              {list.slice(0, shown).map((c, i) => (
                <div key={c.id} className="grid-cell grid-in" style={{ ["--d" as string]: `${(i % PAGE) * 0.025}s` }}>
                  <ProductCard c={c} eager={i < 3} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <Icon name="search" size={34} stroke={1.2} />
              <p>За цими фільтрами нічого не знайшлося.</p>
              <button type="button" className="btn btn-outline" onClick={resetAll}>
                Скинути фільтри
              </button>
            </div>
          )}

          {shown < list.length && (
            <div className="more">
              <p>
                Показано {Math.min(shown, list.length)} з {list.length}
              </p>
              <span className="more-bar" aria-hidden="true">
                <span style={{ width: `${(shown / list.length) * 100}%` }} />
              </span>
              <button type="button" className="btn btn-outline btn-lg" onClick={() => setShown((n) => n + PAGE)}>
                Показати ще {Math.min(PAGE, list.length - shown)}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`sheet ${sheet ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Фільтри" inert={!sheet}>
        <div className="sheet-scrim" onClick={() => setSheet(false)} />
        <div className="sheet-panel">
          <div className="sheet-head">
            <b>Фільтри</b>
            <button type="button" className="icon-btn" onClick={() => setSheet(false)} aria-label="Закрити">
              <Icon name="close" size={20} />
            </button>
          </div>
          <div className="sheet-body">{filters}</div>
          <div className="sheet-foot">
            <button type="button" className="btn btn-ghost" onClick={resetAll}>
              Скинути
            </button>
            <button type="button" className="btn" onClick={() => setSheet(false)}>
              Показати {goods(list.length)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
