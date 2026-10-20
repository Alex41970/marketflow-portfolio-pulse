# Full content pages for top bar and footer links

Every link in the top utility bar and the footer becomes a real page with full content, in the same institutional style. Each page carries the demo disclaimers.

## Top bar pages
- **/individuals**: hero, who it's for, a three-step "how it works", a feature grid, a live markets preview, and FAQs.
- **/advisors**: managing many demo client accounts, a picture of the advisor dashboard, and practice tools for model portfolios and rebalancing.
- **/institutions**: what's offered (back-office console, audit log, white-label branding, team training), a security section, and a contact call to action.
- **/education**: a course library (beginner, intermediate and advanced), a glossary, articles and a "practise in the simulator" call to action.

## Footer pages
- **Platform:**
  - /platform/workstation: a tour of each panel, with a live chart.
  - /platform/mobile: responsive features and a phone mockup.
  - /platform/risk-tools: margin, buying power, position limits and how orders are confirmed.
  - /platform/api: an illustrative API overview with code samples, all labelled "simulated".
- **Markets:** /markets/stocks, /markets/etfs, /markets/forex and /markets/crypto. Each has an intro, a live quotes table filtered to that asset type, trading hours, an illustrative fee table and key facts.
- **Company:**
  - /about: the existing page, with more content.
  - /careers: values, perks and sample openings.
  - /press: press kit, brand facts and news items marked "sample".
  - /contact: a contact form that shows a confirmation and stores nothing, plus office details marked "placeholder".
- **Support:**
  - /help: a searchable help centre with categories and FAQs.
  - /status: system components, each with a live "operational" badge.
  - /security: account protection, data handling and the demo-only notice.
- The footer's Education link goes to /education.

## Shared building blocks
Reusable page sections: a page header, feature grid, alternating image and text rows, FAQ accordion, call-to-action band, stat strip and a quotes table already filtered to one asset type. The top bar and footer links switch from plain text to real links. A breadcrumb shows on the sub-pages.

## Content notes
All copy is original. Any names, numbers, addresses and job openings are clearly marked as sample or placeholder until the client supplies real ones.

## Technical details
- Flat route files such as `platform.workstation.tsx` and `markets.stocks.tsx`. Because `/platform` and `/markets` already exist as pages, the sub-pages use the un-nested `platform_.x.tsx` naming so they render as separate pages.
- Each route gets its own `head()` with a unique title, description, og:title and og:description.
- Shared sections go in `src/components/site/Sections.tsx`. `MarketsTable` gains an optional `fixedClass` setting.
