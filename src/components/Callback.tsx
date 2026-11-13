"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { Icon } from "./Icons";

type Kind = "consult" | "oneclick" | "wholesale";
export const openCallback = (kind: Kind = "consult", product?: string) => window.dispatchEvent(new CustomEvent("open-callback", { detail: { kind, product } }));

export function CallbackButton({ kind = "consult", product, className, children }: { kind?: Kind; product?: string; className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => openCallback(kind, product)}>
      {children}
    </button>
  );
}

/** Ukrainian mobile mask: +380 XX XXX XX XX. Accepts paste in any format. */
export function maskPhone(v: string) {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("380")) d = d.slice(3);
  else if (d.startsWith("80")) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  d = d.slice(0, 9);
  const p = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return d ? `+380 ${p.join(" ")}` : "";
}

const COPY: Record<Kind, { eyebrow: string; title: string; button: string; topic?: string }> = {
  consult: { eyebrow: "Консультація", title: "Підберемо догляд саме для вас", button: "Чекаю на пораду", topic: "Тип шкіри, що турбує, бюджет…" },
  oneclick: { eyebrow: "Купити в один клік", title: "Залиште номер — оформимо за вас", button: "Замовити в один клік" },
  wholesale: { eyebrow: "Оптова співпраця", title: "Оптові ціни для салонів і магазинів", button: "Надіслати запит", topic: "Що цікавить, орієнтовні обсяги, місто…" },
};

export function CallbackForm({ kind = "consult", product, onDone }: { kind?: Kind; product?: string; onDone?: () => void }) {
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const copy = COPY[kind];

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    const res = await fetch("/api/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, name: f.get("name"), phone, product, topic: f.get("topic"), website: f.get("website") }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok) {
      setState("done");
      onDone?.();
    } else {
      setState("error");
      setError(data?.error ?? "Не вдалося надіслати.");
    }
  };

  if (state === "done")
    return (
      <div className="form-done">
        <span className="form-done-icon">
          <Icon name="check" size={28} />
        </span>
        <p>
          <b>Дякуємо!</b> Зв’яжемося з вами найближчим часом у Telegram, Viber або телефоном.
        </p>
      </div>
    );

  return (
    <form className="form" onSubmit={submit}>
      <label className="field">
        <span>Ім’я</span>
        <input name="name" autoComplete="given-name" placeholder="Як до вас звертатися" maxLength={80} />
      </label>
      <label className="field">
        <span>Телефон *</span>
        <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+380 __ ___ __ __" required value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} />
      </label>
      {copy.topic && (
        <label className="field">
          <span>{kind === "wholesale" ? "Запит" : "Що підібрати?"}</span>
          <textarea name="topic" rows={3} placeholder={copy.topic} maxLength={500} />
        </label>
      )}
      <input name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {state === "error" && (
        <p className="form-error" role="alert">
          {error} Напишіть нам у{" "}
          <a href={site.telegram} target="_blank" rel="noopener noreferrer">
            Telegram
          </a>{" "}
          або{" "}
          <a href={site.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          .
        </p>
      )}
      <button type="submit" className="btn btn-lg btn-block" disabled={state === "sending"}>
        {state === "sending" ? "Надсилаємо…" : copy.button}
      </button>
      <p className="form-note">Без спаму. Номер потрібен лише для зв’язку з вами.</p>
    </form>
  );
}

export function CallbackModal() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("consult");
  const [product, setProduct] = useState<string | undefined>();
  const [key, setKey] = useState(0);
  const pathname = usePathname();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<{ kind?: Kind; product?: string }>).detail;
      setKind(d?.kind ?? "consult");
      setProduct(d?.product);
      setKey((k) => k + 1);
      setOpen(true);
    };
    window.addEventListener("open-callback", onOpen);
    return () => window.removeEventListener("open-callback", onOpen);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => box.current?.querySelector<HTMLInputElement>("input[name=phone]")?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`modal ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="cb-title" inert={!open}>
      <div className="modal-scrim" onClick={() => setOpen(false)} />
      <div className="modal-box" ref={box}>
        <button type="button" className="icon-btn modal-x" onClick={() => setOpen(false)} aria-label="Закрити">
          <Icon name="close" size={20} />
        </button>
        <p className="eyebrow">{COPY[kind].eyebrow}</p>
        <h2 id="cb-title" className="modal-title">
          {COPY[kind].title}
        </h2>
        {product && <p className="modal-product">{product}</p>}
        <CallbackForm key={key} kind={kind} product={product} />
      </div>
    </div>
  );
}
