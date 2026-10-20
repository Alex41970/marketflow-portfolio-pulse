import { describe, it, expect } from "vitest";
import { canWithdraw } from "./funding";

describe("withdrawal rules", () => {
  it("blocks withdrawing more than the balance", () => expect(canWithdraw(1000, 0, 1000.01)).toBe(false));
  it("allows withdrawing the full balance", () => expect(canWithdraw(1000, 0, 1000)).toBe(true));
  it("counts other pending withdrawals", () => expect(canWithdraw(1000, 600, 500)).toBe(false));
  it("rejects zero amounts", () => expect(canWithdraw(1000, 0, 0)).toBe(false));
});
