import type { Metadata } from "next";
import { CallbackForm } from "@/components/Callback";
import { Icon, SocialIcon } from "@/components/Icons";
import { PageHero } from "@/components/Shared";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакти та опт",
  description: `Livesta One — магазин косметики LIVESTA, ${site.city}. Instagram ${site.handle}, Telegram-канал, консультації та оптова співпраця.`,
  alternates: { canonical: "/kontakty" },
};

export default function Kontakty() {
  return (
    <>
      <PageHero eyebrow="Контакти" title={"Ми *на зв’язку*"} lead={`Магазин косметики LIVESTA в ${site.city === "Ізмаїл" ? "Ізмаїлі" : site.city}. Найшвидше відповідаємо в Instagram і Telegram.`} crumbs={[{ href: "/", label: "Головна" }, { label: "Контакти" }]} />
      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="wrap split">
          <div className="social-cards">
            <a className="social-card" href={site.instagram} target="_blank" rel="noopener noreferrer" data-reveal>
              <span className="ic">
                <SocialIcon name="Instagram" size={24} />
              </span>
              <span>
                <b>Instagram</b>
                <small>{site.handle} · новинки, відгуки, бокси</small>
              </span>
              <Icon name="arrowUpRight" size={20} />
            </a>
            <a className="social-card" href={site.telegram} target="_blank" rel="noopener noreferrer" data-reveal style={{ ["--d" as string]: ".08s" }}>
              <span className="ic">
                <SocialIcon name="Telegram" size={24} />
              </span>
              <span>
                <b>Telegram-канал</b>
                <small>Акції каталогу та нові надходження</small>
              </span>
              <Icon name="arrowUpRight" size={20} />
            </a>
            {site.phone && (
              <a className="social-card" href={site.phoneHref} data-reveal style={{ ["--d" as string]: ".16s" }}>
                <span className="ic">
                  <Icon name="phone" size={24} />
                </span>
                <span>
                  <b>{site.phone}</b>
                  <small>{site.hours}</small>
                </span>
                <Icon name="arrowUpRight" size={20} />
              </a>
            )}
            <div className="social-card" data-reveal style={{ ["--d" as string]: ".24s" }}>
              <span className="ic">
                <Icon name="pin" size={24} />
              </span>
              <span>
                <b>{site.city}, Україна</b>
                <small>Самовивіз за домовленістю · відправка по всій Україні</small>
              </span>
            </div>
          </div>
          <div className="form-card" id="opt">
            <p className="eyebrow">Оптова співпраця</p>
            <h2 className="display-sm" style={{ marginTop: 12 }}>
              Для салонів, косметологів і магазинів
            </h2>
            <p className="muted" style={{ marginTop: 10 }}>
              Залиште контакти — надішлемо оптові умови та допоможемо зі стартовим замовленням.
            </p>
            <CallbackForm kind="wholesale" />
          </div>
        </div>
      </section>
    </>
  );
}
