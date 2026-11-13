import type { Metadata } from "next";
import { Checkout } from "@/components/Checkout";
import { PageHero } from "@/components/Shared";

export const metadata: Metadata = { title: "Оформлення замовлення", robots: { index: false } };

export default function Koshyk() {
  return (
    <>
      <PageHero eyebrow="Кошик" title={"Оформлення *замовлення*"} lead="Три короткі кроки — і ми зв’яжемося з вами, щоб підтвердити замовлення. Онлайн-оплата не потрібна." crumbs={[{ href: "/", label: "Головна" }, { label: "Кошик" }]} />
      <div className="wrap">
        <Checkout />
      </div>
    </>
  );
}
