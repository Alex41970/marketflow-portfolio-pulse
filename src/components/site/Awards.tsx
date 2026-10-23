import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrand, type Award } from "@/lib/useBrand";

function Seal({ a, variant }: { a: Award; variant: number }) {
  const inner = (
    <>
      {a.issuer && <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">{a.issuer}</span>}
      <span className="text-sm font-semibold leading-tight">{a.title}</span>
      {a.year && <span className="num text-xs">{a.year}</span>}
    </>
  );
  switch (variant % 4) {
    case 0:
      return <div className="grid h-36 w-36 place-items-center rounded-full bg-navy p-5 text-center text-navy-foreground shadow-lg ring-4 ring-navy-accent"><div className="flex flex-col items-center gap-1.5">{inner}</div></div>;
    case 1:
      return (
        <div className="relative flex h-36 w-32 flex-col items-center rounded-t-lg rounded-b-[45%] border-4 border-border bg-card px-3 pt-3 text-center text-foreground shadow-lg">
          {a.issuer && <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{a.issuer}</span>}
          <span className="-mx-5 mt-2 w-[calc(100%+2.5rem)] bg-navy py-1 text-sm font-bold text-navy-foreground">{a.title.match(/^#\d+/)?.[0] ?? "★"}</span>
          <span className="mt-2 text-sm font-semibold leading-tight">{a.title.replace(/^#\d+\s*/, "")}</span>
          {a.year && <span className="num mt-1 text-xs text-muted-foreground">{a.year}</span>}
        </div>
      );
    case 2:
      return <div className="flex h-36 w-28 flex-col items-center justify-center gap-1.5 bg-gain px-3 pb-4 text-center text-primary-foreground shadow-lg [clip-path:polygon(0_0,100%_0,100%_100%,50%_88%,0_100%)]">{inner}</div>;
    default:
      return (
        <div className="grid h-36 w-36 place-items-center rounded-full bg-navy-accent p-5 text-center text-navy-foreground shadow-lg ring-4 ring-warning">
          <div className="flex flex-col items-center gap-1">
            <span className="flex gap-0.5 text-warning"><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /></span>
            {inner}
          </div>
        </div>
      );
  }
}

/** Admin-controlled awards strip; renders nothing until enabled with at least one award. */
export function AwardsSection() {
  const b = useBrand();
  const list = b.awards.filter((a) => a.title.trim());
  if (!b.awardsEnabled || !list.length) return null;
  return (
    <section className="border-y bg-card">
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="text-3xl font-semibold">{b.awardsHeading}</h2>
        <div className={`mx-auto mt-10 grid gap-10 sm:grid-cols-2 ${list.length >= 4 ? "lg:grid-cols-4" : list.length === 3 ? "lg:grid-cols-3" : ""}`}>
          {list.map((a, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="grid h-40 place-items-center"><Seal a={a} variant={i} /></div>
              {a.caption && <p className="mt-4 max-w-[14rem] whitespace-pre-line text-sm text-muted-foreground">{a.caption}</p>}
            </div>
          ))}
        </div>
        <Button asChild variant="outline" className="mt-10 border-primary text-primary hover:bg-primary hover:text-primary-foreground"><Link to="/press">See all awards</Link></Button>
      </div>
    </section>
  );
}
