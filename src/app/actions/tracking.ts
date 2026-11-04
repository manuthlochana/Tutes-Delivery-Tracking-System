"use server";

import { createPublicServerClient } from "@/lib/supabase/server";
import { sanitizeSearchQuery } from "@/lib/phone";
import { trackSLPostBarcode, SLPostTrackingResult } from "@/lib/slpost";

export interface ParcelSearchResult {
  tracking_code: string;
  month_tag: string;
  status: string;
  masked_phone: string;
  uploaded_at: string;
}

export interface SearchActionResponse {
  success: boolean;
  error?: string;
  data?: ParcelSearchResult[];
}

// In-memory rate limiting map for basic protection against scrapers
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ipOrKey: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ipOrKey);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) rateLimitMap.delete(key);
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ipOrKey, { count: 1, resetAt: now + 60000 }); // 60-second window
    return true;
  }

  if (entry.count >= 20) {
    // 20 requests per minute
    return false;
  }

  entry.count++;
  return true;
}

export async function searchParcelAction(queryPhone: string): Promise<SearchActionResponse> {
  try {
    if (!queryPhone || typeof queryPhone !== "string") {
      return { success: false, error: "කරුණාකර වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න (Please enter a valid phone number)." };
    }

    const sanitized = sanitizeSearchQuery(queryPhone);

    if (sanitized.length < 4) {
      return {
        success: false,
        error: "කරුණාකර අවම වශයෙන් අංක 4ක් ඇතුළත් කරන්න (Please enter at least the last 4 digits).",
      };
    }

    if (sanitized.length > 15) {
      return {
        success: false,
        error: "දුරකථන අංකය දිග වැඩියි (Phone number is too long).",
      };
    }

    // Rate limiting check
    const clientKey = sanitized.slice(0, 5); // Simple rate limiter grouping
    if (!checkRateLimit(clientKey)) {
      return {
        success: false,
        error: "Too many search attempts. Please wait a minute and try again (කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න).",
      };
    }

    const supabase = createPublicServerClient();

    // Call the secured Postgres RPC function
    const { data, error } = await supabase.rpc("search_parcel", {
      query_phone: sanitized,
    });

    if (error) {
      console.error("Error invoking search_parcel RPC:", error);
      return {
        success: false,
        error: "සොයාගැනීමේදී දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සාහ කරන්න.",
      };
    }

    return {
      success: true,
      data: (data || []) as ParcelSearchResult[],
    };
  } catch (err: unknown) {
    console.error("Search parcel action unexpected error:", err);
    return {
      success: false,
      error: "සම්බන්ධතා දෝෂයකි. කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න.",
    };
  }
}

export async function getLiveTrackingAction(
  barcode: string
): Promise<SLPostTrackingResult> {
  try {
    if (!barcode || typeof barcode !== "string") {
      return {
        barcode: "",
        status: "Not Found",
        events: [],
        error: "Valid barcode is required",
      };
    }
    return await trackSLPostBarcode(barcode.trim());
  } catch (err: unknown) {
    console.error("Error in getLiveTrackingAction:", err);
    return {
      barcode,
      status: "Not Found",
      events: [],
      error: err instanceof Error ? err.message : "Failed to query SL Post",
    };
  }
}
