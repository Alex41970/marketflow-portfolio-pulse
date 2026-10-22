import { describe, it, expect } from "vitest";
import { applyAdjustment, canBuy, STARTING_BALANCE } from "./rules";

describe("virtual fund rules", () => {
  it("starts new users at $0", () => expect(STARTING_BALANCE).toBe(0));
  it("blocks adjustments that make a balance negative", () => {
    expect(applyAdjustment(50, -100, "x").ok).toBe(false);
  });
  it("allows removing funds down to zero", () => {
    expect(applyAdjustment(50, -50, "x")).toEqual({ ok: true, next: 0 });
  });
  it("requires a reason for every adjustment", () => {
    expect(applyAdjustment(50, 10, "  ").ok).toBe(false);
  });
  it("blocks buying beyond available cash", () => {
    expect(canBuy(100, 2, 60)).toBe(false);
    expect(canBuy(120, 2, 60)).toBe(true);
  });
});
