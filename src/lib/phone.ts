/**
 * Sri Lankan Phone Number Normalization and Masking Utilities
 */

export function cleanPhoneNumber(raw: string | number | null | undefined): string {
  if (!raw) return "";
  
  // Extract digits only
  let digits = String(raw).replace(/\D/g, "");

  // If number starts with 0094, remove 0094
  if (digits.startsWith("0094")) {
    digits = digits.slice(4);
  }
  // If number starts with 94 and length >= 11, strip 94
  else if (digits.startsWith("94") && digits.length >= 11) {
    digits = digits.slice(2);
  }
  // If number starts with 0 and length >= 10, strip leading 0
  else if (digits.startsWith("0") && digits.length >= 10) {
    digits = digits.slice(1);
  }

  return digits;
}

/**
 * Format phone for search query matching RPC behavior
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return "";
  let digits = query.replace(/\D/g, "");

  if (digits.length >= 9) {
    if (digits.startsWith("94")) {
      digits = digits.slice(2);
    } else if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }
  }

  return digits;
}

export function maskPhoneNumber(cleanPhone: string): string {
  if (!cleanPhone || cleanPhone.length < 3) return "*******";
  const last3 = cleanPhone.slice(-3);
  return `*******${last3}`;
}

export function formatSriLankanDisplay(cleanPhone: string): string {
  if (cleanPhone.length === 9) {
    return `0${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5)}`;
  }
  return cleanPhone;
}
