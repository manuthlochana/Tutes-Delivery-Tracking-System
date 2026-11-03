# 📦 Ultra-Secure Parcel Tracking Web Application

Production-ready, high-performance, mobile-optimized Parcel Tracking System built with **Next.js (App Router)**, **Tailwind CSS**, **shadcn/ui**, and **Supabase**. Designed for Sri Lankan delivery workflows (Sri Lanka Post, courier services, student material dispatch).

---

## 🚀 Key Features

### 1. 🔍 Public Tracking Interface (`/`)
- **Lightning-Fast Lookups**: Customers search via their phone number.
- **Smart Phone Parsing**: Supports Sri Lankan formats:
  - Full local: `07XXXXXXXX`
  - International: `+94XXXXXXXX` / `94XXXXXXXX`
  - Partial / Suffix: Any 4 to 9 digits (e.g. searching the last 4 digits `5678`).
- **Found State**:
  - Confetti celebration animation.
  - Prominent tracking code badge (e.g., `BG081146595LK`).
  - Status badge (e.g., `Dispatched` / `Delivery එකට භාරදී ඇත`).
  - One-click **Copy Tracking Code** button with toast feedback.
  - Masked customer phone display (`*******678`) to protect identity.
  - Direct link to SL Post tracking portal.
- **Not Found Fallback**:
  - Sinhala alert card:
    > *"ඔබගේ පාර්සලය තවම Delivery එකට භාරදී නොමැත. කරුණාකර 0789094047 හෝ අපගේ අනෙක් Admin අංකයට WhatsApp පණිවිඩයක් යොමුකර විමසන්න."*
  - Direct WhatsApp button (pre-filled with phone context) & Direct Phone Call button.

### 2. 🛡️ Hardened Security & Anti-Scraping Architecture
- **Row Level Security (RLS)**: Public `anon` role is denied all direct `SELECT` access on the `parcels` and `upload_batches` tables. Scrapers cannot query table data directly.
- **Postgres RPC Function (`search_parcel`)**:
  - `SECURITY DEFINER` function with strict input sanitization.
  - Returns only safe fields: `tracking_code`, `month_tag`, `status`, `masked_phone`, and `uploaded_at`.
  - Rate limiting on server action to mitigate brute-force attempts.
- **Hidden Admin Route**: Located exclusively at `/portal-gate-x92`, with zero public navigation links.

### 3. 📑 Admin Portal (`/portal-gate-x92`)
- **Gatekeeper Authentication**: Protected by server-side HMAC-SHA256 encrypted session tokens and secret passcode verification.
- **Dynamic Column Mapping Multi-File Uploader**:
  - Select 5 to 6 `.xlsx`, `.xls`, or `.csv` files simultaneously.
  - Header inspection and 3-row data preview.
  - Auto-detection for Phone Number and Tracking / BG Code columns.
  - Dropdown selectors allowing the admin to override or map custom headers.
  - Customizable Month/Batch tag (defaults to current month).
  - Chunked uploads (500 records per chunk) with live progress tracking.
- **Batch Management**:
  - View all upload batches, filenames, month tags, record counts, and timestamps.
  - Single-click batch deletion with cascade deletion of related parcels.
  - **Purge Old Data**: Bulk delete batches older than 30, 60, or 90 days.

---

## 🛠️ Environment Variables

Create `.env.local` or configure in Vercel Project Settings:

```env
# Supabase Project
NEXT_PUBLIC_SUPABASE_URL=https://rqkpyxxzildluqxgbdva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Authentication
ADMIN_PASSCODE=admin@track2026
ADMIN_SESSION_SECRET=7f3c4e92a8b1d054e8c1b9a2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2

# Contact Information
ADMIN_WHATSAPP_NUMBER=94789094047
ADMIN_PHONE_NUMBER=0789094047
```

---

## 🚀 Deployment to Vercel

1. Push this repository to GitHub / GitLab.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the environment variables listed above under **Settings > Environment Variables**.
4. Set Build Command: `pnpm build` (or default Next.js build).
5. Deploy!

---

## 🧪 Local Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build production bundle
pnpm build
```
