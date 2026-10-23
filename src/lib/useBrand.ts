import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";

export type Award = { title: string; year: string; caption: string };

export type SiteBrand = {
  name: string; suffix: string; mark: string; tagline: string; disclaimer: string; copyright: string;
  awardsEnabled: boolean; awardsHeading: string; awards: Award[];
};

export const brandQueryKey = ["site-settings"] as const;

function parseAwards(v: unknown): Award[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 4).map((a) => {
    const o = (a ?? {}) as Record<string, unknown>;
    return { title: String(o["title"] ?? ""), year: String(o["year"] ?? ""), caption: String(o["caption"] ?? "") };
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
    awardsEnabled: data?.awards_enabled ?? false,
    awardsHeading: data?.awards_heading || "Recognised for service",
    awards: parseAwards(data?.awards),
  };
}

/** Full display name, e.g. "Ledgerline Markets". */
export const fullName = (b: Pick<SiteBrand, "name" | "suffix">) => [b.name, b.suffix].filter(Boolean).join(" ");

/** Replaces default brand text in a static title with the configured brand. */
export function rebrandText(text: string, b: Pick<SiteBrand, "name" | "suffix">) {
  return text.split(`${BRAND.name} ${BRAND.suffix}`).join(fullName(b)).split(BRAND.name).join(b.name);
}
