import { z } from "zod";

export const registrationSchema = z.object({
  accountType: z.enum(["personal", "business"]),
  firstName: z.string().trim().min(1, "Enter your first name").max(100),
  lastName: z.string().trim().min(1, "Enter your last name").max(100),
  email: z.string().trim().email("Enter a valid email address"),
  callingCode: z.string().regex(/^\+[1-9]\d{0,3}$/, "Choose a country calling code"),
  phone: z.string().trim().regex(/^[0-9 ()-]+$/, "Enter a valid phone number"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine((v) => v, "Accept the Terms and Conditions and Privacy Notice"),
}).refine((v) => v.password === v.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] })
  .refine((v) => {
    const number = v.callingCode.slice(1) + v.phone.replace(/\D/g, "");
    return number.length >= 7 && number.length <= 15;
  }, { message: "Enter a valid phone number (7–15 digits including country code)", path: ["phone"] });

export function registrationMetadata(data: z.infer<typeof registrationSchema>) {
  return {
    first_name: data.firstName, last_name: data.lastName,
    account_type: data.accountType,
    phone: data.callingCode + data.phone.replace(/\D/g, ""),
    terms_accepted: data.termsAccepted,
  };
}