ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS awards_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS awards_heading text NOT NULL DEFAULT 'Recognised for service',
  ADD COLUMN IF NOT EXISTS awards jsonb NOT NULL DEFAULT '[]'::jsonb;
