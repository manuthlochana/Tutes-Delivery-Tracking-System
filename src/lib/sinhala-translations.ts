/**
 * Sinhala Translation & Formatting Utilities for Sri Lanka Post Tracking
 */

export const SL_POST_EVENT_MAP: Record<string, string> = {
  "receive item from customer": "පාර්සලය තැපැල් කාර්යාලයට භාරගැනීම",
  "send item to delivery office": "බෙදාහැරීමේ කාර්යාලය වෙත යොමු කිරීම",
  "receive item at delivery office": "බෙදාහැරීමේ තැපැල් කාර්යාලයට ලැබීම",
  "handed over to post man": "ලියුම් බෙදුම්කරු වෙත භාරදීම",
  "item delivered": "පාර්සලය සාර්ථකව භාරදෙන ලදී",
  "unsuccessful delivery attempt": "භාරදීමට උත්සාහ කළද නොහැකි විය",
  "returned to sender": "නැවත එවූ පාර්ශවය වෙත හරවා යැවීම",
  "redirected": "වෙනත් කාර්යාලයකට යොමු කිරීම",
};

export const SL_POST_STATUS_MAP: Record<string, string> = {
  Delivered: "භාරදී ඇත",
  "In Transit": "ප්‍රවාහනයේ පවතී",
  "Out for Delivery": "බෙදාහැරීමට රැගෙන යයි",
  Dispatched: "තැපැල් කාර්යාලයට ලැබී ඇත",
  "Not Found": "තොරතුරු නොමැත",
};

/**
 * Translates raw SL Post event descriptions into natural, clear Sinhala.
 */
export function translateEventDescription(desc: string): string {
  if (!desc) return "තැපැල් සැකසුම් ක්‍රියාවලිය";
  const normalized = desc.trim().toLowerCase();

  // Exact or prefix match
  for (const [key, value] of Object.entries(SL_POST_EVENT_MAP)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  // Fallback pattern matching
  if (normalized.includes("delivered")) return "පාර්සලය සාර්ථකව භාරදෙන ලදී";
  if (normalized.includes("post man") || normalized.includes("delivery")) {
    return "බෙදාහැරීමේ අංශය වෙත යොමු කිරීම";
  }
  if (normalized.includes("receive")) return "තැපැල් කාර්යාලයට ලැබීම";
  if (normalized.includes("send") || normalized.includes("dispatch")) {
    return "ප්‍රවාහනය සඳහා යොමු කිරීම";
  }

  return desc;
}

/**
 * Translates status strings into Sinhala.
 */
export function translateStatus(status: string): string {
  if (!status) return "තැපැල් කාර්යාලයට ලැබී ඇත";
  return SL_POST_STATUS_MAP[status] || status;
}
