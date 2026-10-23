import { expect, it } from "vitest";
import { ACCOUNT_CURRENCY, compactMoney, fmt } from "./currency";
it("formats account amounts in euros without exchanging numeric balances", () => {
  expect(ACCOUNT_CURRENCY).toBe("EUR");
  expect(fmt(1234.56)).toBe("€1,234.56");
  expect(fmt(0)).toBe("€0.00");
  expect(fmt(-25)).toBe("-€25.00");
  expect(compactMoney(1500)).toBe("€2k");
  expect(compactMoney(25)).toBe("€25");
});