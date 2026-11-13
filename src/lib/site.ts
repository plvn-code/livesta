/**
 * Shop facts. Source: the client's Instagram @__livesta__one («Магазин Livesta», Ізмаїл, відправка по всій Україні, є опт).
 * Phone and exact pickup address are not public yet — see docs/STATUS.md; while `phone` is empty the site offers Telegram/Instagram instead.
 */
export const site = {
  name: "LIVESTA ONE",
  short: "Livesta One",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3015",
  description:
    "Livesta One — магазин доглядової та косметологічної косметики LIVESTA в Ізмаїлі. Догляд за обличчям, волоссям і тілом, парфумерія, макіяж і краса зсередини за цінами каталогу. Відправка по всій Україні.",
  city: "Ізмаїл",
  phone: "" as string,
  phoneHref: "" as string,
  hours: "Щодня 09:00–20:00",
  telegram: "https://t.me/+WJZA750qS1FhZGIy",
  instagram: "https://www.instagram.com/__livesta__one/",
  handle: "@__livesta__one",
  catalogue: { from: "28.11", to: "25.12", until: "2026-12-25T23:59:59+02:00" },
};

export const nav = [
  { href: "/katalog", label: "Каталог" },
  { href: "/katalog?deal=1", label: "Крута ціна" },
  { href: "/dostavka", label: "Доставка й оплата" },
  { href: "/kontakty", label: "Контакти" },
];

/** Shown on product pages, in the cart and on /dostavka. */
export const delivery = [
  { id: "np", title: "Нова пошта", note: "У відділення або поштомат по всій Україні, за тарифами перевізника." },
  { id: "ukr", title: "Укрпошта", note: "Економна доставка у відділення Укрпошти по всій Україні." },
  { id: "pickup", title: "Самовивіз в Ізмаїлі", note: "Точку видачі й час погодимо в месенджері після замовлення." },
] as const;

export const payment = [
  { id: "cod", title: "Накладений платіж", note: "Оплата при отриманні на пошті." },
  { id: "card", title: "Переказ на картку", note: "Реквізити надішлемо після підтвердження замовлення." },
] as const;
