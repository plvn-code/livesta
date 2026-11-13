import Link from "next/link";

export default function NotFound() {
  return (
    <section className="nf">
      <div className="nf-in">
        <b aria-hidden="true">404</b>
        <p className="eyebrow">Сторінку не знайдено</p>
        <h1 className="display-md">
          Цей засіб <em>розібрали</em>
        </h1>
        <p className="lead">Схоже, сторінку перенесли або товару вже немає в каталозі. Подивіться, що є зараз.</p>
        <div className="band-actions">
          <Link href="/katalog" className="btn btn-lg">
            До каталогу
          </Link>
          <Link href="/" className="btn btn-lg btn-outline">
            На головну
          </Link>
        </div>
      </div>
    </section>
  );
}
