import { NextResponse } from "next/server";
import { getById } from "@/lib/catalog";
import { price } from "@/lib/format";
import { deliver, limited, str, validPhone } from "@/lib/orders";
import { delivery, payment } from "@/lib/site";

/** Checkout: re-prices the cart from the catalogue (never trusts client prices), then sends the order to the shop. No online payment. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Некоректний запит." }, { status: 400 });
  if (str(body.website, 200)) return NextResponse.json({ ok: true, number: "0" }); // honeypot
  if (limited(req)) return NextResponse.json({ error: "Забагато спроб. Спробуйте за кілька хвилин." }, { status: 429 });

  const name = str(body.name, 80);
  const phone = str(body.phone, 24);
  if (!name) return NextResponse.json({ error: "Вкажіть, будь ласка, ім’я.", field: "name" }, { status: 422 });
  if (!validPhone(phone)) return NextResponse.json({ error: "Перевірте номер телефону.", field: "phone" }, { status: 422 });

  const ship = delivery.find((d) => d.id === body.delivery) ?? delivery[0];
  const pay = payment.find((p) => p.id === body.payment) ?? payment[0];
  const city = str(body.city, 80);
  const branch = str(body.branch, 120);
  if ((ship.id === "np" || ship.id === "ukr") && (!city || !branch)) return NextResponse.json({ error: "Вкажіть місто й відділення пошти.", field: "city" }, { status: 422 });

  const items = (Array.isArray(body.items) ? body.items : [])
    .slice(0, 60)
    .map((it: { id?: unknown; qty?: unknown }) => ({ p: getById(String(it?.id ?? "")), qty: Math.max(1, Math.min(99, Math.round(Number(it?.qty) || 1))) }))
    .filter((x: { p: unknown }) => x.p) as { p: NonNullable<ReturnType<typeof getById>>; qty: number }[];
  if (!items.length) return NextResponse.json({ error: "Кошик порожній." }, { status: 422 });

  const total = items.reduce((n, x) => n + x.p.price * x.qty, 0);
  const number = `L${Date.now().toString(36).slice(-5).toUpperCase()}`;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";

  const text = [
    `Клієнт: ${name}`,
    `Телефон: ${phone}`,
    `Доставка: ${ship.title}${ship.id !== "pickup" ? ` — ${city}, ${branch}` : ""}`,
    `Оплата: ${pay.title}`,
    str(body.comment, 600) ? `Коментар: ${str(body.comment, 600)}` : null,
    body.noCall ? "Можна не телефонувати — підтвердити в месенджері" : null,
    "",
    ...items.map((x, i) => `${i + 1}. [${x.p.id}] ${x.p.name}${x.p.vol ? `, ${x.p.vol}` : ""} × ${x.qty} = ${price(x.p.price * x.qty)}\n   ${site}/tovar/${x.p.slug}`),
    "",
    `Разом: ${price(total)}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const ok = await deliver("order", `🛒 Замовлення ${number} — ${price(total)}`, text, {
    number, name, phone, delivery: ship.id, payment: pay.id, city, branch, comment: str(body.comment, 600),
    items: items.map((x) => ({ id: x.p.id, name: x.p.name, qty: x.qty, price: x.p.price })), total,
  });
  if (!ok) return NextResponse.json({ error: "Не вдалося надіслати замовлення." }, { status: 502 });
  return NextResponse.json({ ok: true, number, total });
}
