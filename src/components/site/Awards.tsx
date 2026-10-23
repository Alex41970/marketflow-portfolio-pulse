import { Link } from "@tanstack/react-router";
import { Award as AwardIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrand } from "@/lib/useBrand";

const STYLES = [
  "rounded-full bg-navy text-navy-foreground ring-4 ring-primary/30",
  "rounded-t-xl rounded-b-[45%] border-2 bg-card text-foreground",
  "rounded-t-md [clip-path:polygon(0_0,100%_0,100%_100%,50%_88%,0_100%)] bg-primary text-primary-foreground",
  "rounded-full bg-navy-accent text-navy-foreground ring-4 ring-warning/60",
];

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
              <div className={`grid h-36 w-36 place-items-center p-4 shadow-lg ${STYLES[i % 4]}`}>
                <div className="flex flex-col items-center gap-1">
                  {i % 2 === 0 ? <AwardIcon className="h-5 w-5 opacity-80" /> : <span className="flex gap-0.5 text-warning"><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /></span>}
                  <span className="text-sm font-semibold leading-tight">{a.title}</span>
                  {a.year && <span className="num text-xs opacity-80">{a.year}</span>}
                </div>
              </div>
              {a.caption && <p className="mt-4 max-w-[14rem] whitespace-pre-line text-sm text-muted-foreground">{a.caption}</p>}
            </div>
          ))}
        </div>
        <Button asChild variant="outline" className="mt-10 border-primary text-primary hover:bg-primary hover:text-primary-foreground"><Link to="/press">See all awards</Link></Button>
      </div>
    </section>
  );
}
