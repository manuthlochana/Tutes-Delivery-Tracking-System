import { TrackingSearch } from "@/components/TrackingSearch";
import { Package, Shield, Zap, Truck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="w-full border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Parcel Track</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  SL Post & Courier
                </span>
              </h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Official Student Tute & Material Tracking Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live System</span>
          </div>
        </div>
      </header>

      {/* Main Hero & Search Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full flex flex-col items-center">
        {/* Hero Title */}
        <div className="text-center space-y-3 max-w-xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
            <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>පාර්සල් ලුහුබැඳීමේ පද්ධතිය &bull; Fast Delivery Tracking</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
            ඔබගේ පාර්සලයේ තත්ත්වය <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              ක්ෂණිකව දැනගන්න
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            ඔබ ලියාපදිංචි කළ දුරකථන අංකය ඇතුළත් කර අදාළ Tracking / BG කේතය ලබාගන්න.
          </p>
        </div>

        {/* Tracking Search Component */}
        <TrackingSearch />

        {/* Value Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-12 pt-8 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">ක්ෂණික සෙවීම</div>
              <div className="text-[11px] text-zinc-500">Ultra-fast direct DB lookup</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">දත්ත රහස්‍යතාව</div>
              <div className="text-[11px] text-zinc-500">Masked phone privacy shield</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">SL Post Ready</div>
              <div className="text-[11px] text-zinc-500">Direct courier tracking code</div>
            </div>
          </div>
        </div>
      </main>

      {/* Public Footer (Never links to admin portal) */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Official Parcel Delivery System. All rights reserved.</span>
          <span>Sri Lanka Post & Courier Delivery Network</span>
        </div>
      </footer>
    </div>
  );
}
