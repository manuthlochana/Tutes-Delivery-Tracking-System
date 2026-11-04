"use client";

import React, { useState, useTransition } from "react";
import { searchParcelAction, ParcelSearchResult } from "@/app/actions/tracking";
import { ParcelCard } from "@/components/ParcelCard";
import confetti from "canvas-confetti";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Clock,
} from "lucide-react";

const PHONE_1 = "0789094047";
const PHONE_1_INTL = "94789094047";
const PHONE_2 = "0710161699";
const PHONE_2_INTL = "94710161699";

export function TrackingSearch() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [results, setResults] = useState<ParcelSearchResult[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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

      if (!res.success) {
        setErrorMsg(res.error || "සොයාගැනීමේදී දෝෂයක් සිදුවිය.");
        setResults([]);
      } else {
        const found = res.data || [];
        setResults(found);
        if (found.length > 0) {
          try {
            confetti({
              particleCount: 65,
              spread: 55,
              origin: { y: 0.7 },
              colors: ["#10b981", "#3b82f6", "#f59e0b", "#6366f1"],
            });
          } catch {
            // fallback
          }
        }
      }
    });
  };

  const whatsappText = encodeURIComponent("මගේ A/L Media Tute එක ගැන දැනගැනීමට අවශ්යයි");

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-1">
      {/* Search Input Box */}
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-lg dark:shadow-black/40">
        <form onSubmit={handleSearch} className="space-y-3.5">
          <label className="block text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
            දුරකථන අංකය (Mobile Number)
          </label>

          <div className="relative flex items-center">
            {/* Country Flag Badge */}
            <div className="absolute left-2.5 sm:left-3.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-300 select-none">
              <span className="text-sm">🇱🇰</span>
              <span>+94</span>
            </div>

            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න (උදා: 071XXXXXXX)"
              className="w-full pl-20 sm:pl-24 pr-12 py-3.5 sm:py-4 bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              autoComplete="tel"
              required
            />

            {phoneNumber && (
              <button
                type="button"
                onClick={() => setPhoneNumber("")}
                className="absolute right-3.5 text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5 px-0.5">
            <span>සම්පූර්ණ අංකය හෝ අවසන් අංක 4-9 ඇතුළත් කළ හැක.</span>
            <span className="font-mono text-zinc-400">e.g. 0789094047, 9094047</span>
          </div>

          <button
            type="submit"
            disabled={isPending || !phoneNumber.trim()}
            className="w-full mt-1 py-3.5 sm:py-4 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl sm:rounded-2xl shadow-md shadow-emerald-700/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 text-sm sm:text-base min-h-[48px]"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span>පාර්සලය සොයමින් පවතී...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>Tute එක පරීක්ෂා කරන්න (Track Parcel)</span>
                <ArrowRight className="w-4 h-4 ml-0.5 shrink-0" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Message Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div className="font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Results Area */}
      {hasSearched && results && results.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                හමුවූ නිබන්ධන පාර්සල් ({results.length})
              </span>
            </h3>
            <span className="text-[11px] text-zinc-500 font-medium">
              පසුගිය මාස 3 ඉතිහාසය
            </span>
          </div>

          {/* Cards List: Top one is latest and default expanded, older ones collapsed */}
          <div className="space-y-3">
            {results.map((parcel, idx) => (
              <ParcelCard
                key={`${parcel.tracking_code}-${idx}`}
                parcel={parcel}
                isLatest={idx === 0}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fallback Card When Not Found (WhatsApp Only - NO Voice Call Buttons) */}
      {hasSearched && results && results.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 border-2 border-red-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg shadow-red-950/5 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                පාර්සලය තවම සොයාගත නොහැකි විය
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                ඔබගේ පාර්සලය තවම Delivery එකට භාරදී නොමැත. කරුණාකර පහත අංකවලට WhatsApp පණිවිඩයක් යොමුකර විමසන්න.
              </p>
            </div>
          </div>

          {/* WhatsApp Only Action Buttons (Calls Removed completely) */}
          <div className="space-y-2.5 pt-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              පන්ති කාර්යාලයීය WhatsApp සහාය (WhatsApp Support Only):
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* WhatsApp Button 1 */}
              <a
                href={`https://wa.me/${PHONE_1_INTL}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-between shadow-md shadow-emerald-700/20 transition-all min-h-[46px]"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                  <span>WhatsApp විමසීම් (Admin 1)</span>
                </div>
                <span className="font-mono text-[11px] opacity-90">{PHONE_1}</span>
              </a>

              {/* WhatsApp Button 2 */}
              <a
                href={`https://wa.me/${PHONE_2_INTL}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-between shadow-md shadow-emerald-700/20 transition-all min-h-[46px]"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                  <span>WhatsApp විමසීම් (Admin 2)</span>
                </div>
                <span className="font-mono text-[11px] opacity-90">{PHONE_2}</span>
              </a>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center pt-1 border-t border-zinc-100 dark:border-zinc-800">
            * පාර්සල් විස්තර දිනපතා සවස තැපැල් කාර්යාලයට භාරදුන් පසු නවතම කාණ්ඩ සමඟ යාවත්කාලීන වේ.
          </div>
        </div>
      )}

      {/* Security & Privacy Notice */}
      <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 text-center px-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Masked Student Privacy &bull; Zero Public Scraping</span>
      </div>
    </div>
  );
}
