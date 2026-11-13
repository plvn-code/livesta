import type { Metadata } from "next";
import { CallbackButton } from "@/components/Callback";
import { Icon, type IconName } from "@/components/Icons";
import { PageHero } from "@/components/Shared";
import { delivery, payment, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Доставка й оплата",
  description: "Відправляємо косметику LIVESTA Новою поштою та Укрпоштою по всій Україні. Накладений платіж або переказ на картку, самовивіз в Ізмаїлі.",
  alternates: { canonical: "/dostavka" },
};

const ICONS: Record<string, IconName> = { np: "truck", ukr: "box", pickup: "pin" };

const FAQ = [
  { q: "Коли відправите замовлення?", a: "Після того як ми підтвердимо замовлення в месенджері або телефоном. Номер ТТН надішлемо одразу після відправки." },
  { q: "Чи це оригінальна продукція?", a: "Так. Ми працюємо з офіційною продукцією LIVESTA, а ціни на сайті — з чинного каталогу компанії." },
  { q: `Чому ціни діють до ${site.catalogue.to}?`, a: `LIVESTA випускає каталог на кожен період. Ціни «Крута ціна» діють з ${site.catalogue.from} до ${site.catalogue.to}; після цього ми оновимо каталог на сайті.` },
  { q: "Допоможете підібрати догляд?", a: "Звісно. Розкажіть про тип шкіри чи волосся і що вас турбує — порадимо засоби під ваш бюджет і складемо послідовність догляду." },
  { q: "Чи можна запакувати в подарунок?", a: "Так, напишіть про це в коментарі до замовлення — запакуємо святково." },
  { q: "Чи є оптові ціни?", a: "Так, працюємо з оптом для салонів, магазинів і косметологів. Залиште запит — надішлемо умови." },
];

export default function Dostavka() {
  return (
    <>
      <PageHero eyebrow="Покупцям" title={"Доставка *й оплата*"} lead="Відправляємо з Ізмаїла по всій Україні. Оплата — при отриманні або переказом на картку, без онлайн-платежів на сайті." crumbs={[{ href: "/", label: "Головна" }, { label: "Доставка й оплата" }]} />
      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <p className="eyebrow" style={{ marginBottom: 18 }}>
            Доставка
          </p>
          <div className="info-grid">
            {delivery.map((d, i) => (
              <article key={d.id} className="info-card" data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <span className="ic">
                  <Icon name={ICONS[d.id] ?? "truck"} size={24} />
                </span>
                <h3>{d.title}</h3>
                <p>{d.note}</p>
              </article>
            ))}
          </div>
          <p className="eyebrow" style={{ margin: "56px 0 18px" }}>
            Оплата
          </p>
          <div className="info-grid">
            {payment.map((d, i) => (
              <article key={d.id} className="info-card" data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <span className="ic">
                  <Icon name={d.id === "cod" ? "box" : "card"} size={24} />
                </span>
                <h3>{d.title}</h3>
                <p>{d.note}</p>
              </article>
            ))}
            <article className="info-card" data-reveal style={{ ["--d" as string]: ".16s" }}>
              <span className="ic">
                <Icon name="gift" size={24} />
              </span>
              <h3>Подарункове пакування</h3>
              <p>Напишіть у коментарі до замовлення — запакуємо святково.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="sec sec-blush">
        <div className="wrap split">
          <div>
            <p className="eyebrow">Питання й відповіді</p>
            <h2 className="display-md" style={{ marginTop: 16 }}>
              Коротко <em>про головне</em>
            </h2>
            <p className="lead" style={{ marginTop: 18 }}>
              Не знайшли відповіді? Напишіть нам — відповімо особисто.
            </p>
            <CallbackButton kind="consult" className="btn btn-lg" >
              Поставити питання
            </CallbackButton>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q} <Icon name="plus" size={20} />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
