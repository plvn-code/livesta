# Status — started 2026-11-13

Local: http://localhost:3015. No GitHub / Vercel yet — ask the user first.

## Done
Full shop in Ukrainian: intro, video hero with floating cut-out products, category tiles, «Крута ціна» pinned rail, word-scrub manifest, 4-step skincare ritual (sticky video), gift-box band (cover photo from the client's PDF), series hover wall, catalogue countdown band, perks, Instagram/Telegram/wholesale band. Catalogue with filters (section / sub-category / series / price / «Крута ціна» / search / sort, all in the URL), 8 section pages, 1166 product pages (gallery + zoom, old price + saving, description / composition / usage from livesta.ua, related), cart drawer + checkout (Нова пошта / Укрпошта / самовивіз, накладений платіж / переказ на картку), ⌘K search (name, series or code), consultation / one-click / wholesale forms, delivery page with FAQ, contacts, 404, sitemap, robots. Checked at 1440 and 390 px, no horizontal scroll, no console errors, cart → checkout → order tested.

## Orders: decide before launch
`src/lib/orders.ts` sends to Telegram (`TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`) and/or email via Resend. With neither set it appends to `data/orders.jsonl` (local only; on Vercel orders would fail → visitor is told to write in Telegram/Instagram).

## Questions for the client
1. **Where should orders and requests go?** Telegram (her account / a group), email?
2. **Phone number and Viber/Telegram contact** — not on Instagram; the site currently offers only Instagram + Telegram channel. `site.phone` in `src/lib/site.ts`.
3. **Shop name** on the site: «LIVESTA · one beauty store» (from the handle). OK, or another name/logo? Is she an official LIVESTA consultant (can we say «офіційна продукція»)?
4. **Stock.** User said the PDF = what is in stock, so all 1166 items show «В наявності». 243 of them are «disabled» on livesta.ua right now (probably new for 28.11). Remove anything?
5. **Prices** are «Крута ціна» of the 28.11–25.12 catalogue (same as livesta.ua today). The countdown and banner say prices are valid until 25.12 — after that the catalogue must be refreshed (see CLAUDE.md). Who sends the next PDF?
6. **Sections.** The whole LIVESTA range is in (incl. Для дому 53, Здоров’я 105, toothbrushes, hair dye). Keep everything or only care cosmetics?
7. **Delivery facts**: dispatch days, free-delivery threshold, pickup point in Izmail, card details for transfers.
8. **Wholesale terms** to show on the site?
9. 13 products have no photo on livesta.ua (cards show empty white).
10. Hero/band videos are licensed stock (Pexels). Does she have her own footage / photos?
11. Domain.

## Licences
Pexels licence (free commercial use): hero cream https://www.pexels.com/video/7234935/ · drops https://www.pexels.com/video/6611904/ · ritual (mask) https://www.pexels.com/video/9697874/ · satin https://www.pexels.com/video/7233561/ (encoded, not used yet). Product photos, names, descriptions: livesta.ua (manufacturer). Gift photo: cover of the client's LIVESTA catalogue PDF. Cormorant Garamond & Manrope: SIL OFL.
