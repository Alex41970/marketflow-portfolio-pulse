import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";

export type SiteBrand = {
  name: string; suffix: string; mark: string; tagline: string; disclaimer: string; copyright: string;
};

export const brandQueryKey = ["site-settings"] as const;

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
  };
}
