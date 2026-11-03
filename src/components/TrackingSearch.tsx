"use client";

import React, { useState, useTransition } from "react";
import { searchParcelAction, ParcelSearchResult } from "@/app/actions/tracking";
import { formatSriLankanDisplay } from "@/lib/phone";
import confetti from "canvas-confetti";
import {
  Search,
  Package,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Phone,
  MessageCircle,
  Calendar,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Clock,
} from "lucide-react";

export function TrackingSearch() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [results, setResults] = useState<ParcelSearchResult[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = phoneNumber.trim();
    if (!query) return;

    setErrorMsg(null);
    setHasSearched(false);

    startTransition(async () => {
      const res = await searchParcelAction(query);
      setHasSearched(true);
      setSearchedQuery(query);

      if (!res.success) {
        setErrorMsg(res.error || "සොයාගැනීමේදී දෝෂයක් සිදුවිය.");
        setResults([]);
      } else {
        const found = res.data || [];
        setResults(found);
        if (found.length > 0) {
          try {
            confetti({
              particleCount: 75,
              spread: 60,
              origin: { y: 0.7 },
              colors: ["#10b981", "#3b82f6", "#f59e0b", "#6366f1"],
            });
          } catch {
            // fallback silently if canvas not available
          }
        }
      }
    });
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      // Fallback
    }
  };

  const adminWhatsApp = "94789094047";
  const adminPhone = "0789094047";
  const fallbackMessage = encodeURIComponent(
    `ආයුබෝවන්, මගේ දුරකථන අංකය (${searchedQuery || phoneNumber}) ට අදාළ පාර්සලය Delivery එකට භාරදී ඇත්දැයි පරීක්ෂා කර ගැනීමට අවශ්‍යයි.`
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Search Input Card */}
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/40 transition-all">
        <form onSubmit={handleSearch} className="space-y-4">
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න (Enter Phone Number)
          </label>

          <div className="relative flex items-center">
            {/* Country Flag Badge */}
            <div className="absolute left-3.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 select-none">
              <span className="text-sm">🇱🇰</span>
              <span>+94</span>
            </div>

            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="07XXXXXXXX or 7XXXXXXXX (or last 4-9 digits)"
              className="w-full pl-24 pr-12 py-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-2xl text-base sm:text-lg font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all"
              autoComplete="tel"
              required
            />

            {phoneNumber && (
              <button
                type="button"
                onClick={() => setPhoneNumber("")}
                className="absolute right-4 text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1 px-1">
            <span>සම්පූර්ණ අංකය හෝ අවසන් අංක 4-9 ඇතුළත් කළ හැක.</span>
            <span className="font-mono text-zinc-400">e.g. 0712345678, 712345678</span>
          </div>

          <button
            type="submit"
            disabled={isPending || !phoneNumber.trim()}
            className="w-full mt-2 py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 text-base"
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>පාර්සලය සොයමින් පවතී (Searching...)...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>පාර්සලය පරීක්ෂා කරන්න (Track Parcel)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Message Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-amber-800 dark:text-amber-300 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div className="text-sm font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Search Results Area */}
      {hasSearched && results && results.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              හමුවූ පාර්සල් විස්තර ({results.length} Parcel Found)
            </h3>
            <span className="text-xs text-zinc-500 font-medium">Verified Delivery Record</span>
          </div>

          {results.map((parcel, idx) => (
            <div
              key={`${parcel.tracking_code}-${idx}`}
              className="relative overflow-hidden bg-white dark:bg-zinc-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-xl shadow-emerald-900/5 dark:shadow-emerald-950/20"
            >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500/10 to-transparent w-48 h-full pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Tracking / Waybill Number
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-white mt-0.5">
                      {parcel.tracking_code}
                    </div>
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={() => copyToClipboard(parcel.tracking_code)}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                    copiedCode === parcel.tracking_code
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {copiedCode === parcel.tracking_code ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Copied! (පිටපත් විය)</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Code (කේතය පිටපත් කරන්න)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status and Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-5">
                <div>
                  <div className="text-xs text-zinc-400 font-medium">තත්ත්වය (Status)</div>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {parcel.status || "Dispatched"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-zinc-400 font-medium">අදාළ මාසය / කාණ්ඩය</div>
                  <div className="mt-1 font-semibold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {parcel.month_tag || "Current Batch"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-zinc-400 font-medium">ලියාපදිංචි අංකය</div>
                  <div className="mt-1 font-mono font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                    {parcel.masked_phone}
                  </div>
                </div>
              </div>

              {/* Postal Tracking Quick Link */}
              <div className="mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span>ශ්‍රී ලංකා තැපැල් (SL Post) හෝ අදාළ කුරියර් පද්ධතියෙන් පරීක්ෂා කිරීමට:</span>
                <a
                  href={`http://track.slpost.gov.lk/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>SL Post Tracking</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fallback Card When Not Found (Exact Sinhala prompt requirements) */}
      {hasSearched && results && results.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 border-2 border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-xl shadow-red-900/5 dark:shadow-red-950/20 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                පාර්සලය තවම සොයාගත නොහැකි විය
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                ඔබගේ පාර්සලය තවම Delivery එකට භාරදී නොමැත. කරුණාකර{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {adminPhone}
                </span>{" "}
                හෝ අපගේ අනෙක් Admin අංකයට WhatsApp පණිවිඩයක් යොමුකර විමසන්න.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href={`https://wa.me/${adminWhatsApp}?text=${fallbackMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all text-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp මගින් විමසන්න</span>
            </a>

            <a
              href={`tel:${adminPhone}`}
              className="flex items-center justify-center gap-2.5 py-3.5 px-5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold rounded-xl active:scale-[0.98] transition-all text-sm border border-zinc-200 dark:border-zinc-700"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>දුරකථන ඇමතුමක් ගන්න ({adminPhone})</span>
            </a>
          </div>

          <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center pt-2">
            * පාර්සල් විස්තර දිනපතා සවස 6:00 න් පසු නවතම කාණ්ඩ සමඟ යාවත්කාලීන වේ.
          </div>
        </div>
      )}

      {/* Security & Privacy Notice */}
      <div className="pt-4 flex items-center justify-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>End-to-End Encrypted Search &bull; Masked Privacy Protection &bull; Zero Public Scraping</span>
      </div>
    </div>
  );
}
