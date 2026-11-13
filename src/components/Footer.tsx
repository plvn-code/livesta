import Link from "next/link";
import { sections } from "@/lib/catalog";
import { site } from "@/lib/site";
import { CallbackButton } from "./Callback";
import { SocialIcon } from "./Icons";
import { Logo } from "./Shared";

export function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div className="ftr-about">
            <Logo />
            <p>Доглядова та косметологічна косметика LIVESTA з Ізмаїла — з відправкою по всій Україні. Підберемо догляд, запакуємо в подарунок, відповімо на кожне питання.</p>
          </div>
          <div>
            <h3>Каталог</h3>
            <ul>
              {sections.slice(0, 7).map((s) => (
                <li key={s.id}>
                  <Link href={`/katalog/${s.id}`}>{s.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Покупцям</h3>
            <ul>
              <li>
                <Link href="/katalog?deal=1">Крута ціна</Link>
              </li>
              <li>
                <Link href="/dostavka">Доставка й оплата</Link>
              </li>
              <li>
                <Link href="/kontakty">Контакти</Link>
              </li>
              <li>
                <CallbackButton kind="consult">Консультація</CallbackButton>
              </li>
              <li>
                <CallbackButton kind="wholesale">Оптова співпраця</CallbackButton>
              </li>
            </ul>
          </div>
          <div>
            <h3>Ми на зв’язку</h3>
            <ul>
              <li>
                <a href={site.instagram} target="_blank" rel="noopener noreferrer">
                  <SocialIcon name="Instagram" size={16} /> {site.handle}
                </a>
              </li>
              <li>
                <a href={site.telegram} target="_blank" rel="noopener noreferrer">
                  <SocialIcon name="Telegram" size={16} /> Telegram-канал
                </a>
              </li>
              {site.phone && (
                <li>
                  <a href={site.phoneHref}>{site.phone}</a>
                </li>
              )}
              <li>
                <span>{site.city}, Україна</span>
              </li>
            </ul>
          </div>
        </div>
        <p className="ftr-big" aria-hidden="true">
          LIVESTA
        </p>
        <div className="ftr-bottom">
          <span>© {new Date().getFullYear()} Livesta One · магазин косметики LIVESTA</span>
          <span>
            Ціни каталогу {site.catalogue.from}–{site.catalogue.to}
          </span>
        </div>
      </div>
    </footer>
  );
}
