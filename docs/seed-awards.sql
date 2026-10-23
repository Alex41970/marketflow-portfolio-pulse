UPDATE public.site_settings SET
  awards_enabled = true,
  awards_heading = 'Award Winning Platform & Services',
  awards = '[
    {"issuer":"BrokerChooser","title":"Best online broker","year":"2026","caption":"Best Online Broker"},
    {"issuer":"StockBrokers.com","title":"#1 Professional Trading","year":"2026","caption":"#1 Professional Trading\n#1 International Trading"},
    {"issuer":"NerdWallet","title":"Best Online Broker","year":"2026","caption":"Best Online Broker\nfor Advanced Traders"},
    {"issuer":"Investing in the Web","title":"Best global broker overall","year":"2026","caption":"Best Global Broker Overall"}
  ]'::jsonb
WHERE id = 1;
