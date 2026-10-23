import { describe, expect, it } from "vitest";
import { registrationSchema, registrationMetadata } from "./registration";

const valid = { accountType: "personal", firstName: "Alex", lastName: "Example", email: "alex@example.com", callingCode: "+44", phone: "7700 900123", password: "Example123", confirmPassword: "Example123", termsAccepted: true };
describe("registration requirements", () => {
  it("accepts personal and business accounts only", () => {
    expect(registrationSchema.safeParse(valid).success).toBe(true);
    expect(registrationSchema.safeParse({ ...valid, accountType: "business" }).success).toBe(true);
    expect(registrationSchema.safeParse({ ...valid, accountType: "admin" }).success).toBe(false);
  });
  it("requires first and last names", () => {
    for (const field of ["firstName", "lastName"]) expect(registrationSchema.safeParse({ ...valid, [field]: " " }).success).toBe(false);
  });
  it("requires a valid email", () => expect(registrationSchema.safeParse({ ...valid, email: "invalid" }).success).toBe(false));
  it("requires phone number and country code", () => {
    expect(registrationSchema.safeParse({ ...valid, phone: "" }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...valid, callingCode: "" }).success).toBe(false);
    expect(registrationMetadata(registrationSchema.parse(valid)).phone).toBe("+447700900123");
  });
  it("requires at least eight password characters", () => {
    expect(registrationSchema.safeParse({ ...valid, password: "1234567", confirmPassword: "1234567" }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...valid, password: "12345678", confirmPassword: "12345678" }).success).toBe(true);
  });
  it("requires matching confirmation", () => expect(registrationSchema.safeParse({ ...valid, confirmPassword: "Different123" }).success).toBe(false));
  it("requires terms and privacy agreement", () => expect(registrationSchema.safeParse({ ...valid, termsAccepted: false }).success).toBe(false));
  it("stores profile details, not passwords or privileges in metadata", () => {
    expect(registrationMetadata(registrationSchema.parse(valid))).toEqual({ first_name: "Alex", last_name: "Example", account_type: "personal", phone: "+447700900123", terms_accepted: true });
  });
});