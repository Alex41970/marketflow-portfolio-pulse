import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";

export type Award = { issuer: string; title: string; year: string; caption: string };

export type SiteBrand = {
  name: string; suffix: string; mark: string; tagline: string; disclaimer: string; copyright: string;
  awardsEnabled: boolean; awardsHeading: string; awards: Award[];
};

/** Built-in awards shown when the database has none saved (no SQL needed). */
export const DEFAULT_AWARDS: Award[] = [
  { issuer: "BrokerChooser", title: "Best online broker", year: "2026", caption: "Best Online Broker" },
  { issuer: "StockBrokers.com", title: "#1 Professional Trading", year: "2026", caption: "#1 Professional Trading\n#1 International Trading" },
  { issuer: "NerdWallet", title: "Best Online Broker", year: "2026", caption: "Best Online Broker\nfor Advanced Traders" },
  { issuer: "Investing in the Web", title: "Best global broker overall", year: "2026", caption: "Best Global Broker Overall" },
];
const DEFAULT_AWARDS_HEADING = "Award Winning Platform & Services";

export const brandQueryKey = ["site-settings"] as const;

function parseAwards(v: unknown): Award[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 4).map((a) => {
    const o = (a ?? {}) as Record<string, unknown>;
    return { issuer: String(o["issuer"] ?? ""), title: String(o["title"] ?? ""), year: String(o["year"] ?? ""), caption: String(o["caption"] ?? "") };
  });
}

/** Admin-editable branding; falls back to the defaults in brand.ts until loaded. */
export function useBrand(): SiteBrand {
  const { data } = useQuery({
    queryKey: brandQueryKey,
    queryFn: async () => (await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()).data,
    staleTime: 60_000,
  });
  return {
    name: data?.brand_name || BRAND.name,
    suffix: data?.brand_suffix ?? BRAND.suffix,
    mark: data?.brand_mark || BRAND.mark,
    tagline: data?.tagline || BRAND.tagline,
    disclaimer: data?.footer_text || BRAND.disclaimer,
    copyright: data?.copyright ?? "",
    awardsEnabled: parseAwards(data?.awards).some((x) => x.title.trim()) ? (data?.awards_enabled ?? true) : true,
    awardsHeading: data?.awards_heading && data.awards_heading !== "Recognised for service" ? data.awards_heading : DEFAULT_AWARDS_HEADING,
    awards: (() => { const a = parseAwards(data?.awards).filter((x) => x.title.trim()); return a.length ? a : DEFAULT_AWARDS; })(),
  };
}

/** Full display name, e.g. "Ledgerline Markets". */
export const fullName = (b: Pick<SiteBrand, "name" | "suffix">) => [b.name, b.suffix].filter(Boolean).join(" ");

/** Replaces default brand text in a static title with the configured brand. */
export function rebrandText(text: string, b: Pick<SiteBrand, "name" | "suffix">) {
  return text.split(`${BRAND.name} ${BRAND.suffix}`).join(fullName(b)).split(BRAND.name).join(b.name);
}
