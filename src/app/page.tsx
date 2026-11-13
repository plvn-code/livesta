import Link from "next/link";
import { CallbackButton } from "@/components/Callback";
import { Clip, Countdown, Hero, Manifest, Rail, Ritual, SeriesWall, type Step } from "@/components/home/Motion";
import { Icon, SocialIcon } from "@/components/Icons";
import { Marquee, Split } from "@/components/Shared";
import { bestDeals, getById, products, sections, seriesList, toCard, type Product } from "@/lib/catalog";
import { img } from "@/lib/format";
import { site } from "@/lib/site";

/** Hand-picked cut-outs (clean silhouettes that read well on blush). Unknown ids are skipped, so a catalogue update never breaks the page. */
const HERO_FLOATS = ["221105", "111203", "221010"];
const MANIFEST_ART = ["111301", "221026", "110805", "114529"];

const TILES: { id: string; tint: string; art: string[] }[] = [
  { id: "oblychchia", tint: "t-rose", art: ["221010", "221105"] },
  { id: "volossia", tint: "t-nude", art: ["532113", "530101"] },
  { id: "tilo", tint: "t-sand", art: ["110805", "220210"] },
  { id: "parfumeriia", tint: "t-ink", art: ["114528", "114516"] },
  { id: "makiiazh", tint: "t-rose", art: ["114301", "253206"] },
  { id: "zdorovia", tint: "t-nude", art: ["114712", "114711"] },
];

const SERIES_LINES: Record<string, string> = {};

/** Ids that exist and have a cut-out, topped up with the first cut-outs of the section in catalogue order. */
function pickArt(ids: string[], section: string | null, n: number) {
  const ok = ids.filter((id) => getById(id)?.cut);
  for (const p of products) {
    if (ok.length >= n) break;
    if (p.cut && (!section || p.section === section) && !ok.includes(p.id)) ok.push(p.id);
  }
  return ok.slice(0, n);
}

function firstMatching(section: string, rx: RegExp, n: number, not?: RegExp) {
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const p of products) {
    if (out.length >= n) break;
    if (p.section !== section || !p.imgs || !rx.test(p.name.toLowerCase()) || (not && not.test(p.name.toLowerCase()))) continue;
    const k = p.series ?? p.id;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out.map(toCard);
}

export default function Home() {
  const deals = bestDeals(14);
  const steps: Step[] = [
    { title: "Очищення", text: "Делікатно знімає макіяж, SPF і денний пил, не пересушуючи шкіру. Чиста шкіра краще приймає все, що буде далі.", cards: firstMatching("oblychchia", /пінк|гель для вмиван|міцеляр|очищ|гідрофільн/, 2) },
    { title: "Тонізування", text: "Відновлює pH після вмивання, зволожує і готує шкіру до активних засобів.", cards: firstMatching("oblychchia", /тонік|тонер|лосьйон|есенц/, 2) },
    { title: "Сироватка", text: "Концентрований актив під конкретну задачу: зволоження, сяйво, пружність або рівний тон.", cards: firstMatching("oblychchia", /сироват|серум|концентрат/, 2) },
    { title: "Крем і захист", text: "Запечатує зволоження й живлення. Вранці — обов’язково з SPF, ввечері — щось насиченіше.", cards: firstMatching("oblychchia", /крем/, 2, /для рук|для ніг|для тіла|bb|cc|тональн/) },
  ].filter((s) => s.cards.length);

  const series = seriesList
    .filter((s) => s.name !== "LIVESTA")
    .slice(0, 6)
    .map((s) => {
      const ps = products.filter((p) => p.series === s.id && p.imgs);
      // Label = the section most of the series lives in (THALIA is mostly care, not perfume).
      const bySec = new Map<string, number>();
      for (const p of ps) bySec.set(p.section, (bySec.get(p.section) ?? 0) + 1);
      const top = [...bySec.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      const sec = sections.find((x) => x.id === top);
      // Three cut-outs from different sub-categories, so the panel shows the range, not three shades of one lipstick.
      const art: string[] = [];
      const subs = new Set<string | null>();
      for (const p of ps) {
        if (p.cut && art.length < 3 && !subs.has(p.sub)) {
          art.push(p.id);
          subs.add(p.sub);
        }
      }
      for (const p of ps) if (p.cut && art.length < 3 && !art.includes(p.id)) art.push(p.id);
      return { id: s.id, name: s.name, count: s.count, art, line: SERIES_LINES[s.id] ?? sec?.name ?? "" };
    })
    .filter((s) => s.art.length);

  const floats = pickArt(HERO_FLOATS, "oblychchia", 3);
  const tiles = TILES.map((t) => ({ ...t, sec: sections.find((s) => s.id === t.id) })).filter((t) => t.sec);
  const sets = products.filter((p) => /набір|бокс|подарунк/i.test(p.name)).length;

  return (
    <>
      <Hero floats={floats}>
        <p className="eyebrow" data-reveal>
          Доглядова косметика LIVESTA · {site.city}
        </p>
        <Split as="h1" className="display-xl hero-title" text={"Краса, що\n*сяє* зсередини"} delay={0.2} />
        <p className="lead hero-lead" data-reveal style={{ ["--d" as string]: ".5s" }}>
          Професійний догляд за обличчям, волоссям і тілом за цінами каталогу. Підберемо засоби саме під вашу шкіру — і відправимо по всій Україні.
        </p>
        <div className="hero-cta" data-reveal style={{ ["--d" as string]: ".65s" }}>
          <Link href="/katalog" className="btn btn-lg">
            До каталогу <Icon name="arrow" size={18} />
          </Link>
          <CallbackButton kind="consult" className="btn btn-lg btn-outline">
            Підібрати догляд
          </CallbackButton>
        </div>
      </Hero>

      <Marquee items={["Обличчя", "Волосся", "Тіло", "Парфумерія", "Макіяж", "Колаген", "Подарункові бокси", "Крута ціна"]} />

      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <p className="eyebrow" data-reveal>
                Обирайте за потребою
              </p>
              <Split className="display-lg" text={"Ваш догляд —\nвід голови *до п’ят*"} />
            </div>
            <Link href="/katalog" className="btn btn-outline" data-reveal>
              Увесь каталог · {products.length}
            </Link>
          </div>
          <div className="cats">
            {tiles.map((t, i) => (
              <Link key={t.id} href={`/katalog/${t.id}`} className={`cat ${t.tint}`} data-reveal data-cursor="Відкрити" style={{ ["--d" as string]: `${(i % 3) * 0.08}s` }}>
                <span className="cat-name">{t.sec!.name}</span>
                <span className="cat-art" aria-hidden="true">
                  {pickArt(t.art, t.id, 2).map((id) => (
                    <img key={id} src={img(id, "c")} alt="" loading="lazy" />
                  ))}
                </span>
                <span className="cat-meta">
                  <p>{t.sec!.lead}</p>
                  <span className="cat-go">
                    <Icon name="arrowUpRight" size={20} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {deals.length > 0 && (
        <Rail
          cards={deals}
          href="/katalog?deal=1&sort=deal"
          more="Усі пропозиції «Крута ціна»"
          head={
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <div>
                <p className="eyebrow" data-reveal>
                  Крута ціна · до {site.catalogue.to}
                </p>
                <Split className="display-lg" text={"Найвигідніше\nв *цьому каталозі*"} />
              </div>
              <p className="lead" data-reveal style={{ maxWidth: 360 }}>
                Знижки до −{Math.max(...deals.map((c) => (c.o ? Math.round((1 - c.p / c.o) * 100) : 0)))}% від звичайної ціни. Встигніть, поки діє каталог.
              </p>
            </div>
          }
        />
      )}

      <Manifest
        text="Ми віримо, що догляд — це не поспіх перед дзеркалом, а щоденний ритуал любові до себе. Тому підбираємо засоби особисто для вас і пояснюємо, як вони працюють."
        accent={["ритуал", "любові", "себе.", "особисто"]}
        art={pickArt(MANIFEST_ART, null, 4)}
      />

      {steps.length > 1 && (
        <section className="sec">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="eyebrow" data-reveal>
                  Ритуал догляду
                </p>
                <Split className="display-lg" text={"Чотири кроки\nдо *сяйної* шкіри"} />
              </div>
              <CallbackButton kind="consult" className="btn btn-outline">
                Скласти мій ритуал
              </CallbackButton>
            </div>
            <Ritual steps={steps} />
          </div>
        </section>
      )}

      <section className="gift">
        <div className="gift-media" data-reveal="zoom">
          <img src="/images/gift.webp" alt="Рожева подарункова коробка LIVESTA із золотою стрічкою" loading="lazy" data-parallax="-0.06" />
        </div>
        <div className="gift-copy">
          <p className="eyebrow" data-reveal>
            Здійснюємо бажання
          </p>
          <Split className="display-lg" text={"Подарунок,\nякий *точно*\nсподобається"} />
          <p className="lead" data-reveal>
            Зберемо бокс під бюджет і характер: догляд, аромат, улюблена косметика. Святково запакуємо й відправимо одразу одержувачу.
          </p>
          <ul className="gift-list" data-reveal>
            <li>Готові набори{sets ? ` — ${sets} в каталозі` : ""}</li>
            <li>Індивідуальний бокс під ваш бюджет</li>
            <li>Подарункове пакування на прохання</li>
          </ul>
          <div className="hero-cta" style={{ marginTop: 0 }} data-reveal>
            <Link href="/katalog?q=набір" className="btn btn-light btn-lg">
              Готові набори
            </Link>
            <CallbackButton kind="consult" className="btn btn-outline-light btn-lg">
              Зібрати бокс
            </CallbackButton>
          </div>
        </div>
      </section>

      {series.length > 2 && (
        <section className="sec sec-dark">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="eyebrow" data-reveal>
                  Улюблені серії
                </p>
                <Split className="display-lg" text={"Лінійки, до яких\n*повертаються*"} />
              </div>
            </div>
            <SeriesWall items={series} />
          </div>
        </section>
      )}

      <section className="vband">
        <Clip src="/video/drops.mp4" poster="/images/drops-poster.webp" />
        <div className="vband-in">
          <p className="eyebrow">Каталог {site.catalogue.from} — {site.catalogue.to}</p>
          <Split className="display-lg" text={"Ціни «Крута ціна»\nдіють ще"} />
          <Countdown until={site.catalogue.until} />
          <Link href="/katalog?deal=1&sort=deal" className="btn btn-lg">
            Обрати зі знижкою <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="perks">
            {[
              { i: "shield" as const, t: "Оригінальна LIVESTA", d: "Офіційна продукція та ціни з чинного каталогу компанії." },
              { i: "heart" as const, t: "Особистий підбір", d: "Порадимо догляд під тип шкіри, волосся та бюджет — безкоштовно." },
              { i: "truck" as const, t: "По всій Україні", d: "Нова пошта та Укрпошта, оплата при отриманні." },
              { i: "wholesale" as const, t: "Є опт", d: "Окремі умови для салонів, косметологів і магазинів." },
            ].map((p, i) => (
              <div className="perk" key={p.t} data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <Icon name={p.i} size={28} stroke={1.3} />
                <b>{p.t}</b>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-blush">
        <div className="wrap social">
          <div>
            <p className="eyebrow" data-reveal>
              Будьте поруч
            </p>
            <Split className="display-lg" text={"Новинки, відгуки\nй *бокси* — у нас\nв Instagram"} />
            <p className="lead" style={{ marginTop: 20 }} data-reveal>
              Показуємо засоби в дії, ділимося відгуками клієнток і першими розповідаємо про новий каталог.
            </p>
          </div>
          <div className="social-cards">
            <a className="social-card" href={site.instagram} target="_blank" rel="noopener noreferrer" data-reveal>
              <span className="ic">
                <SocialIcon name="Instagram" size={24} />
              </span>
              <span>
                <b>{site.handle}</b>
                <small>Магазин Livesta · 2 000+ підписниць</small>
              </span>
              <Icon name="arrowUpRight" size={20} />
            </a>
            <a className="social-card" href={site.telegram} target="_blank" rel="noopener noreferrer" data-reveal style={{ ["--d" as string]: ".08s" }}>
              <span className="ic">
                <SocialIcon name="Telegram" size={24} />
              </span>
              <span>
                <b>Telegram-канал</b>
                <small>Акції та нові надходження</small>
              </span>
              <Icon name="arrowUpRight" size={20} />
            </a>
            <CallbackButton kind="wholesale" className="social-card social-card-btn">
              <span className="ic">
                <Icon name="wholesale" size={24} />
              </span>
              <span>
                <b>Оптова співпраця</b>
                <small>Умови для салонів і магазинів</small>
              </span>
              <Icon name="arrowUpRight" size={20} />
            </CallbackButton>
          </div>
        </div>
      </section>

    </>
  );
}
