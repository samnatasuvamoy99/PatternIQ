import { promises as dns } from "dns";

// Dedicated high-speed DNS resolver using Cloudflare & Google DNS (resolves in ~30ms)
const dnsResolver = new dns.Resolver();
dnsResolver.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]);

// Common disposable / burner email domains
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

// Dummy / placeholder domains
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

// Known domain typos with correction mappings
const DOMAIN_TYPOS: Record<string, string> = {
  // Gmail typos
  "gmail.come": "gmail.com",
  "gmail.comm": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.coom": "gmail.com",
  "gmail.cpm": "gmail.com",
  "gmail.xom": "gmail.com",
  "gamil.com": "gmail.com",
  "gamil.come": "gmail.com",
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gamil.co": "gmail.com",
  "gmail.co": "gmail.com",
  "gmaik.com": "gmail.com",
  "gmajl.com": "gmail.com",
  "gmaio.com": "gmail.com",
  "gmaul.com": "gmail.com",
  "gmaol.com": "gmail.com",

  // Yahoo typos
  "yahoo.come": "yahoo.com",
  "yahoo.comm": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yaho.com": "yahoo.com",
  "yaho.come": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yaho.co": "yahoo.com",
  "yahoo.co": "yahoo.com",

  // Hotmail & Outlook typos
  "hotmail.come": "hotmail.com",
  "hotmail.comm": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "outlook.come": "outlook.com",
  "outlook.comm": "outlook.com",
  "outlook.con": "outlook.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "outllok.com": "outlook.com",

  // Apple iCloud typos
  "icloud.come": "icloud.com",
  "iclod.com": "icloud.com",
  "icould.com": "icloud.com",

  // Others
  "redifmail.com": "rediffmail.com",
  "rediffmial.com": "rediffmail.com",
  "rediffmail.come": "rediffmail.com",
  "protomail.com": "protonmail.com",
  "proton.con": "proton.me",
  "proton.come": "proton.me",
};

// Known common invalid TLD endings
const INVALID_TLD_SUFFIXES = new Set([
  "come", "comm", "con", "coom", "cpm", "xom", "vom", "cin", "om", "cmo"
]);

// In-memory cache for DNS MX / domain lookups (domain -> { valid: boolean, error?: string, timestamp: number })
const dnsCache = new Map<string, { valid: boolean; error?: string; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Validates an email address syntax, checks for domain typos, disposable domains,
 * and performs DNS MX/A record verification to guarantee the domain exists and can receive email.
 */
export async function validateEmailAddress(email: string): Promise<{
  isValid: boolean;
  error?: string;
  suggestion?: string;
  domain?: string;
}> {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email address is required" };
  }

  const trimmed = email.trim().toLowerCase();

  // Basic length checks
  if (trimmed.length < 5) {
    return { isValid: false, error: "Email address is too short" };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: "Email address is too long" };
  }

  // Split into local part and domain
  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return { isValid: false, error: "Please enter a valid email address with a single '@' sign" };
  }

  const [localPart, domain] = parts;

  // Local part validation
  if (!localPart || localPart.length < 1) {
    return { isValid: false, error: "The email username (before '@') cannot be empty" };
  }
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return { isValid: false, error: "The email username cannot start or end with a period" };
  }
  if (localPart.includes("..")) {
    return { isValid: false, error: "The email username cannot contain consecutive periods ('..')" };
  }

  // Domain structure validation
  if (!domain || !domain.includes(".")) {
    return { isValid: false, error: "The email domain must include a valid extension (e.g., .com, .edu, .org)" };
  }

  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    return { isValid: false, error: "The email domain format is invalid. Please check the spelling." };
  }

  // Check for common typos
  if (DOMAIN_TYPOS[domain]) {
    const suggestion = `${localPart}@${DOMAIN_TYPOS[domain]}`;
    return {
      isValid: false,
      error: `Did you mean @${DOMAIN_TYPOS[domain]}? Please check your email spelling.`,
      suggestion,
      domain,
    };
  }

  // Check for invalid TLD suffixes like .come, .con, .comm
  const domainSegments = domain.split(".");
  const tld = domainSegments[domainSegments.length - 1];
  if (INVALID_TLD_SUFFIXES.has(tld)) {
    return {
      isValid: false,
      error: `The email domain ends with '.${tld}', which is not a valid domain extension. Did you mean '.com'?`,
      domain,
    };
  }

  // Block disposable / throwaway domains
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: "Temporary or disposable email addresses are not permitted. Please use your active personal or work/university email.",
      domain,
    };
  }

  // Block dummy / placeholder domains
  if (DUMMY_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: `The domain '@${domain}' is a placeholder or test domain. Please provide a real email address.`,
      domain,
    };
  }

  // Check cache first for DNS MX resolution
  const now = Date.now();
  const cached = dnsCache.get(domain);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    if (!cached.valid) {
      return { isValid: false, error: cached.error, domain };
    }
    return { isValid: true, domain };
  }

  // DNS MX resolution to confirm domain exists and accepts mail
  try {
    const checkDns = async (): Promise<boolean> => {
      try {
        const mxRecords = await dnsResolver.resolveMx(domain);
        if (mxRecords && mxRecords.length > 0) {
          return true;
        }
      } catch (mxErr: any) {
        // If no MX record, check A record as fallback (RFC 5321)
        if (mxErr.code === "ENOTFOUND" || mxErr.code === "ENODATA" || mxErr.code === "NOTFOUND" || mxErr.code === "SERVFAIL") {
          try {
            const aRecords = await dnsResolver.resolve4(domain);
            return aRecords && aRecords.length > 0;
          } catch {
            return false;
          }
        }
        return false;
      }
      return false;
    };

    // 4000ms timeout guard
    const timeoutPromise = new Promise<boolean>((_, reject) =>
      setTimeout(() => reject(new Error("DNS_TIMEOUT")), 4000)
    );

    const hasMailServer = await Promise.race([checkDns(), timeoutPromise]);

    if (!hasMailServer) {
      const errorMsg = `The domain '@${domain}' does not exist or has no active mail servers. Please enter a real, registered email address.`;
      dnsCache.set(domain, { valid: false, error: errorMsg, timestamp: now });
      return { isValid: false, error: errorMsg, domain };
    }

    // Cache successful DNS resolution
    dnsCache.set(domain, { valid: true, timestamp: now });
    return { isValid: true, domain };
  } catch (err: any) {
    const errorMsg = `The domain '@${domain}' does not exist or could not be verified. Please check your email address.`;
    dnsCache.set(domain, { valid: false, error: errorMsg, timestamp: now });
    return { isValid: false, error: errorMsg, domain };
  }
}
