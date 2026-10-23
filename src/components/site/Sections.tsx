import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

export function pageHead(title: string, description: string, path: string) {
  const t = `${title} — ${BRAND.name} ${BRAND.suffix}`;
  return {
    meta: [
      { title: t },
      { name: "description", content: description },
      { property: "og:title", content: t },
      { property: "og:description", content: description },
      { property: "og:url", content: path },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: path }],
  };
}

export function ContentPage({ eyebrow, title, sub, crumbs, children, cta = true, image }: { eyebrow: string; title: string; sub: string; crumbs?: string[]; children: ReactNode; cta?: boolean; image?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-hero text-navy-foreground">
        <div className={`mx-auto max-w-7xl px-6 py-16 ${image ? "grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]" : ""}`}>
          <div>
          {crumbs && (
            <div className="mb-6 flex items-center gap-1 text-xs text-navy-muted">
              <Link to="/" className="hover:text-navy-foreground">Home</Link>
              {crumbs.map((c) => <span key={c} className="flex items-center gap-1"><ChevronRight className="h-3 w-3" />{c === "Markets" ? <Link to="/markets" className="hover:text-navy-foreground">Markets</Link> : c === "Platform" ? <Link to="/platform" className="hover:text-navy-foreground">Platform</Link> : c}</span>)}
            </div>
          )}
          <p className="num text-xs uppercase tracking-[0.2em] text-navy-muted">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-muted">{sub}</p>
          </div>
          {image && <img src={image} alt="" width={1280} height={832} className="aspect-[16/10] w-full rounded-lg object-cover shadow-2xl ring-1 ring-sidebar-border" />}
        </div>
      </section>
      {children}
      {cta && <CtaBand />}
      <SiteFooter />
    </div>
  );
}

export function Section({ title, sub, children, muted }: { title?: string; sub?: string; children: ReactNode; muted?: boolean }) {
  return (
    <section className={muted ? "bg-card" : ""}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        {title && <h2 className="text-3xl font-semibold">{title}</h2>}
        {sub && <p className="mt-2 max-w-2xl text-muted-foreground">{sub}</p>}
        <div className={title || sub ? "mt-8" : ""}>{children}</div>
      </div>
    </section>
  );
}

export function FeatureGrid({ items, cols = 3 }: { items: { icon: LucideIcon; title: string; body: string }[]; cols?: 2 | 3 | 4 }) {
  const c = cols === 4 ? "lg:grid-cols-4" : cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  return (
    <div className={`grid gap-6 sm:grid-cols-2 ${c}`}>
      {items.map(({ icon: I, title, body }) => (
        <div key={title} className="rounded-lg border bg-card p-6 transition-colors hover:border-primary">
          <I className="h-6 w-6 text-primary" />
          <h3 className="mt-4 font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
      ))}
    </div>
  );
}

export function Split({ title, body, bullets, visual, reverse }: { title: string; body: string; bullets?: string[]; visual: ReactNode; reverse?: boolean }) {
  return (
    <div className="grid items-center gap-12 py-8 md:grid-cols-2">
      <div className={reverse ? "md:order-2" : ""}>
        <h3 className="text-2xl font-semibold">{title}</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">{body}</p>
        {bullets && <ul className="mt-4 space-y-2 text-sm">{bullets.map((b) => <li key={b} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{b}</li>)}</ul>}
      </div>
      <div>{visual}</div>
    </div>
  );
}

export function Steps({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((s, i) => (
        <div key={s.title} className="panel p-6">
          <div className="num grid h-9 w-9 place-items-center rounded-full bg-primary text-sm text-primary-foreground">{i + 1}</div>
          <h3 className="mt-4 font-semibold">{s.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
        </div>
      ))}
    </div>
  );
}

export function Stats({ items }: { items: [string, string][] }) {
  return (
    <div className="border-y bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x px-6 md:grid-cols-4">
        {items.map(([n, l]) => <div key={l} className="px-4 py-8 text-center"><div className="num text-3xl text-primary">{n}</div><div className="mt-1 text-sm text-muted-foreground">{l}</div></div>)}
      </div>
    </div>
  );
}

export function Faq({ items }: { items: [string, string][] }) {
  return (
    <Accordion type="single" collapsible className="panel divide-y px-6">
      {items.map(([q, a]) => (
        <AccordionItem key={q} value={q} className="border-0">
          <AccordionTrigger className="text-left">{q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function KeyValueTable({ head, rows, note }: { head: string[]; rows: string[][]; note?: string }) {
  return (
    <div>
      <div className="panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground"><tr>{head.map((h, i) => <th key={h} className={`py-3 font-medium ${i === 0 ? "px-4" : "pr-4"}`}>{h}</th>)}</tr></thead>
          <tbody className="divide-y">{rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={`py-3 ${i === 0 ? "px-4 font-medium" : "num pr-4"}`}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      {note && <p className="mt-3 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export function MockPanel({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="dark rounded-lg border bg-background p-4 text-foreground shadow-2xl">
      <div className="mb-3 flex items-center justify-between text-xs"><span className="font-semibold uppercase tracking-wider text-muted-foreground">{title}</span><span className="rounded-sm border px-1 text-[9px] uppercase text-muted-foreground">Sample</span></div>
      <div className="divide-y divide-border">{rows.map(([a, b]) => <div key={a} className="flex justify-between py-2 text-sm"><span className="text-muted-foreground">{a}</span><span className="num">{b}</span></div>)}</div>
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-12 md:flex-row">
        <div><h2 className="text-2xl font-semibold">Ready to get started?</h2><p className="mt-1 text-sm opacity-80">Open an account in minutes.</p></div>
        <Button asChild size="lg" variant="secondary"><Link to="/auth" search={{ mode: "signup" }}>Open an account</Link></Button>
      </div>
    </section>
  );
}

export function SampleNote({ children }: { children: ReactNode }) {
  return <p className="mt-4 rounded-md border border-dashed p-3 text-xs text-muted-foreground">{children}</p>;
}

export function Photo({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} loading="lazy" width={1280} height={832} className="aspect-[16/10] w-full rounded-lg object-cover shadow-lg" />;
}

export function Testimonials({ items }: { items: [string, string, string][] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map(([q, n, r]) => (
        <figure key={n} className="panel flex flex-col p-6">
          <div className="text-3xl leading-none text-primary">“</div>
          <blockquote className="mt-2 flex-1 text-sm leading-relaxed">{q}</blockquote>
          <figcaption className="mt-4 border-t pt-4 text-sm"><div className="font-semibold">{n}</div><div className="text-xs text-muted-foreground">{r} · Sample testimonial</div></figcaption>
        </figure>
      ))}
    </div>
  );
}

export function ImageCards({ items }: { items: { img: string; tag: string; title: string; body: string; meta?: string }[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((c) => (
        <article key={c.title} className="panel overflow-hidden transition-shadow hover:shadow-lg">
          <img src={c.img} alt="" loading="lazy" width={1280} height={832} className="aspect-[16/9] w-full object-cover" />
          <div className="p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">{c.tag}</span>
            <h3 className="mt-2 font-semibold leading-snug">{c.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            {c.meta && <p className="mt-3 text-xs text-muted-foreground">{c.meta}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}

export function Quote({ text, by }: { text: string; by: string }) {
  return (
    <figure className="mx-auto max-w-3xl text-center">
      <blockquote className="text-2xl font-medium leading-snug md:text-3xl">“{text}”</blockquote>
      <figcaption className="mt-4 text-sm text-muted-foreground">{by}</figcaption>
    </figure>
  );
}
