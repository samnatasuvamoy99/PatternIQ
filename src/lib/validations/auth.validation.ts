import { z } from "zod";

// Known disposable / temporary throwaway email domain providers
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.net",
  "sharklasers.com",
  "trashmail.com",
  "trashmail.net",
  "dispostable.com",
  "fakemailgenerator.com",
  "nada.ltd",
  "getnada.com",
  "mohmal.com",
  "crazymailing.com",
  "inboxkitten.com",
  "burnermail.io",
  "maildrop.cc",
  "mytemp.email",
  "tempail.com",
  "throwaway.email",
  "generator.email",
  "emailondeck.com",
  "fakeinbox.com",
  "dropmail.me",
  "getairmail.com",
  "spam4.me",
  "grr.la",
  "guerrillamailblock.com",
  "pokemail.net",
]);

// Obvious dummy / placeholder domains
const DUMMY_DOMAINS = new Set([
  "test.com",
  "fake.com",
  "dummy.com",
  "asdf.com",
  "invalid.com",
  "temp.com",
  "aaa.com",
  "xyz.com",
  "example.com",
  "example.org",
  "example.net",
  "sample.com",
  "testing.com",
  "notreal.com",
]);

/**
 * Validates that an email is structurally valid, has a real TLD,
 * and is not a disposable or random throwaway address.
 */
export const validEmailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .min(5, "Email address is too short")
  .max(100, "Email address is too long")
  .email("Please enter a valid email address (e.g. name@gmail.com)")
  .refine(
    (email) => {
      const parts = email.split("@");
      if (parts.length !== 2) return false;
      const [local, domain] = parts;

      // Local part checks
      if (!local || local.length < 2 || !domain) return false;

      // Ensure domain has at least one dot and a valid TLD of at least 2 alpha characters
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) return false;

      const lowerDomain = domain.toLowerCase();

      // Block known disposable/throwaway domains
      if (DISPOSABLE_EMAIL_DOMAINS.has(lowerDomain)) return false;

      // Block known dummy domains
      if (DUMMY_DOMAINS.has(lowerDomain)) return false;

      // Block common typo TLDs (e.g. .come, .con, .comm)
      const domainParts = lowerDomain.split(".");
      const tld = domainParts[domainParts.length - 1];
      const invalidTlds = new Set(["come", "comm", "con", "coom", "cpm", "xom", "cin", "cmo"]);
      if (invalidTlds.has(tld)) return false;

      return true;
    },
    {
      message: "Please enter a valid, active email address (e.g. name@gmail.com with a valid domain extension)",
    }
  );

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: validEmailSchema,
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const loginSchema = z.object({
  email: validEmailSchema,
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
