# New accounts start at $0

## What changes
- New sign-ups start with a $0 balance instead of $100,000. Funds then come only from approved top-ups or from an admin adjustment.
- Remove "$100,000 virtual capital" wording from the public pages (home, individuals, pricing, education, help, and the page descriptions shown in search results).
- Existing accounts keep their current balances.

## What stays
- The Ledgerline brand and the "virtual funds only" strip stay. Both are fixed project rules, and the strip is still needed because no licensing is in place.
- No Interactive Brokers name or logo, and no lookalike domain.

## Technical details
- Migration: update the signup trigger function so new profiles insert with cash = 0 (and bonus = 0).
- Set `STARTING_BALANCE` in src/lib/rules.ts to 0 and update rules.test.ts to match.
- Find "100,000" / "$100K" in src/routes and src/components/site and replace with neutral copy.
- Update the project memory note that says the starting balance is $100,000.
