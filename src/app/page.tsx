import { TrackingSearch } from "@/components/TrackingSearch";
import { Zap, Truck, Shield, Video } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Video Camera Media Icon */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
              <Video className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {/* Branding details */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-white truncate">
                  සුරංග ගමගේ
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                  A/L MASS MEDIA
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                Tute Delivery Tracking Portal
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SL Post Live System</span>
          </div>
        </div>
      </header>

      {/* Main Hero & Search Container */}
      <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-14 w-full flex flex-col items-center">
        {/* Hero Title */}
        <div className="text-center space-y-2.5 sm:space-y-3.5 max-w-2xl mx-auto mb-6 sm:mb-10 px-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-zinc-800/90 border border-emerald-200/80 dark:border-zinc-700 text-[11px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>A/L Media Tute Tracking Portal | සුරංග ගමගේ</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.2]">
            ඔබේ මාසික නිබන්ධන <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              බෙදාහැරීමේ තත්ත්වය පරීක්ෂා කරන්න
            </span>
          </h2>

          <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto font-medium leading-relaxed">
            ඔබ පන්තියට ලියාපදිංචි කළ දුරකථන අංකය ඇතුළත් කර ශ්‍රී ලංකා තැපැල් (SL Post) හරහා ඔබේ Tute Pack එක මේ වන විට පවතින ස්ථානය සජීවීව දැනගන්න.
          </p>
        </div>

        {/* Tracking Search Component with History & Live SL Post Engine */}
        <TrackingSearch />

        {/* Service Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mt-10 pt-6 border-t border-zinc-200/70 dark:border-zinc-800/70">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">ක්ෂණික සෙවීම</div>
              <div className="text-[10px] text-zinc-500 font-medium">Ultra-fast direct DB lookup</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">Live SL Post Status</div>
              <div className="text-[10px] text-zinc-500 font-medium">Real-time domestic tracking</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">දත්ත රහස්‍යතාව</div>
              <div className="text-[10px] text-zinc-500 font-medium">Masked student privacy shield</div>
            </div>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <span>&copy; 2026 A/L Mass Media - Suranga Gamage. All rights reserved.</span>
          <span>Sri Lanka Post Domestic Postal Network</span>
        </div>
      </footer>
    </div>
  );
}
