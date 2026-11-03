import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "parcel_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "fallback-secret-key-32-chars-long!";
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin@track2026";

export function verifyPasscode(inputPasscode: string): boolean {
  if (!inputPasscode) return false;
  return inputPasscode.trim() === ADMIN_PASSCODE.trim();
}

export function generateSessionToken(): string {
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const data = `admin:${expiry}`;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
  return Buffer.from(`${data}:${hmac}`).toString("base64");
}

export function validateSessionToken(token: string | undefined): boolean {
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [role, expiryStr, hmac] = decoded.split(":");

    if (role !== "admin" || !expiryStr || !hmac) return false;

    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) return false;

    const expectedData = `admin:${expiryStr}`;
    const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(expectedData).digest("hex");

    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}

export async function setAdminSessionCookie(): Promise<void> {
  const token = generateSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function checkIsAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return validateSessionToken(sessionToken);
}
