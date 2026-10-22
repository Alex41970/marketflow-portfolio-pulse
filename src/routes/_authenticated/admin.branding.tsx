import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBrand, brandQueryKey } from "@/lib/useBrand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/branding")({
  head: () => ({ meta: [{ title: "Back office — Branding" }, { name: "description", content: "Edit the site name, logo letter and footer." }] }),
  component: Branding,
});

function Branding() {
  const b = useBrand();
  const qc = useQueryClient();
  const [f, setF] = useState(b);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setF(b); }, [b.name, b.suffix, b.mark, b.tagline, b.disclaimer, b.copyright]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    if (!f.name.trim()) { toast.error("Brand name is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({
      brand_name: f.name.trim(), brand_suffix: f.suffix.trim(), brand_mark: f.mark.trim().slice(0, 3) || f.name.trim().slice(0, 1),
      tagline: f.tagline, footer_text: f.disclaimer, copyright: f.copyright, updated_at: new Date().toISOString(),
    }).eq("id", 1);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await qc.invalidateQueries({ queryKey: brandQueryKey });
    toast.success("Branding saved");
  }

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5 rounded-xl border bg-card p-6">
        <div><h2 className="text-lg font-semibold">Branding</h2><p className="text-sm text-muted-foreground">Changes apply to the header, client portal and footer across the site.</p></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-1"><Label>Brand name</Label><Input value={f.name} onChange={set("name")} /></div>
          <div className="space-y-1.5"><Label>Second word (optional)</Label><Input value={f.suffix} onChange={set("suffix")} /></div>
          <div className="space-y-1.5"><Label>Logo letters (max 3)</Label><Input maxLength={3} value={f.mark} onChange={set("mark")} /></div>
        </div>
        <div className="space-y-1.5"><Label>Tagline (footer, under the logo)</Label><Input value={f.tagline} onChange={set("tagline")} /></div>
        <div className="space-y-1.5"><Label>Footer text</Label><Textarea rows={7} value={f.disclaimer} onChange={set("disclaimer")} /><p className="text-xs text-muted-foreground">Line breaks are kept.</p></div>
        <div className="space-y-1.5"><Label>Copyright line (leave empty for automatic)</Label><Input value={f.copyright} onChange={set("copyright")} placeholder={`© ${f.name} ${f.suffix}. All rights reserved.`} /></div>
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save branding"}</Button>
      </div>
      <div className="h-fit overflow-hidden rounded-xl border">
        <div className="border-b bg-card p-4 text-xs uppercase tracking-wider text-muted-foreground">Preview</div>
        <div className="flex items-center gap-2 bg-card p-4 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-sm text-primary-foreground">{f.mark || f.name[0]}</span>
          <span>{f.name}<span className="ml-1 font-normal opacity-70">{f.suffix}</span></span>
        </div>
        <div className="space-y-2 bg-navy p-4 text-xs leading-relaxed text-navy-muted">
          <p>{f.tagline}</p>
          <p className="whitespace-pre-line">{f.disclaimer}</p>
          <p>{f.copyright || `© ${f.name} ${f.suffix}. All rights reserved.`}</p>
        </div>
      </div>
    </div>
  );
}
