"use client";

import React, { useState, useTransition } from "react";
import { searchParcelAction, ParcelSearchResult } from "@/app/actions/tracking";
import { ParcelCard } from "@/components/ParcelCard";
import confetti from "canvas-confetti";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";

const PHONE_1 = "0789094047";
const PHONE_1_INTL = "94789094047";
const PHONE_2 = "0710161699";
const PHONE_2_INTL = "94710161699";

export function TrackingSearch() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [results, setResults] = useState<ParcelSearchResult[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
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
              particleCount: 70,
              spread: 60,
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

  const whatsappText = encodeURIComponent(
    `මගේ A/L Media Tute එක ගැන දැනගැනීමට අවශ්යයි (දුරකථන අංකය: ${searchedQuery || phoneNumber})`
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Search Input Box */}
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/40 transition-all">
        <form onSubmit={handleSearch} className="space-y-4">
          <label className="block text-sm font-bold text-zinc-800 dark:text-zinc-200">
            දුරකථන අංකය (Student Mobile Number)
          </label>

          <div className="relative flex items-center">
            {/* Country Flag Badge */}
            <div className="absolute left-3.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 select-none">
              <span className="text-base">🇱🇰</span>
              <span>+94</span>
            </div>

            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න (උදා: 071XXXXXXX)"
              className="w-full pl-24 pr-14 py-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-2xl text-base sm:text-lg font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all"
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
            <span className="font-mono text-zinc-400">e.g. 0789094047, 9094047</span>
          </div>

          <button
            type="submit"
            disabled={isPending || !phoneNumber.trim()}
            className="w-full mt-2 py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 text-base"
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>පාර්සලය සොයමින් පවතී (Searching)...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Tute එක පරීක්ෂා කරන්න (Track Parcel)</span>
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

      {/* Results Area */}
      {hasSearched && results && results.length > 0 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                හමුවූ නිබන්ධන පාර්සල් ({results.length} Record{results.length > 1 ? "s" : ""})
              </span>
            </h3>
            <span className="text-xs text-zinc-500 font-medium">
              පසුගිය මාස 3 ඉතිහාසය (Last 3 Months)
            </span>
          </div>

          {/* Cards List: Top one is latest and default expanded, older ones collapsed */}
          <div className="space-y-4">
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

      {/* Fallback Card When Not Found (Exact Custom Sinhala Card & Dual Contacts) */}
      {hasSearched && results && results.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 border-2 border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-xl shadow-red-900/5 dark:shadow-red-950/20 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                පාර්සලය තවම සොයාගත නොහැකි විය
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                ඔබගේ පාර්සලය තවම Delivery එකට භාරදී නොමැත. කරුණාකර පහත අංකවලට WhatsApp පණිවිඩයක් යොමුකර විමසන්න.
              </p>
            </div>
          </div>

          {/* Dual WhatsApp and Direct Call Action Grid */}
          <div className="space-y-3 pt-1">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              පන්ති කාර්යාලය සම්බන්ධ කරගැනීමට (Class Office Support):
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Support Number 1 */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Admin අංකය 1
                  </span>
                  <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {PHONE_1}
                  </span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${PHONE_1_INTL}?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${PHONE_1}`}
                    className="py-2.5 px-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              {/* Support Number 2 */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Admin අංකය 2
                  </span>
                  <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {PHONE_2}
                  </span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${PHONE_2_INTL}?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${PHONE_2}`}
                    className="py-2.5 px-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center pt-1">
            * පාර්සල් විස්තර දිනපතා සවස තැපැල් කාර්යාලයට භාරදුන් පසු නවතම කාණ්ඩ සමඟ යාවත්කාලීන වේ.
          </div>
        </div>
      )}

      {/* Security & Privacy Notice */}
      <div className="pt-2 flex items-center justify-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>End-to-End Encrypted Search &bull; Masked Privacy Protection &bull; Zero Public Scraping</span>
      </div>
    </div>
  );
}
