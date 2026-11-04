import { TrackingSearch } from "@/components/TrackingSearch";
import { Package, Shield, Zap, Truck, BookOpen, GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="w-full border-b border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                  සුරංග ගමගේ
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  A/L Mass Media
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                උසස් පෙළ ජනසන්නිවේදනය හා මාධ්‍ය අධ්‍යයනය &bull; Tute Delivery Portal
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
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 w-full flex flex-col items-center">
        {/* Hero Title */}
        <div className="text-center space-y-3.5 max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-zinc-800/90 border border-emerald-200/80 dark:border-zinc-700 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>A/L Media Tute Tracking Portal | සුරංග ගමගේ</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.18]">
            ඔබේ මාසික නිබන්ධන <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              බෙදාහැරීමේ තත්ත්වය පරීක්ෂා කරන්න
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto font-medium">
            ඔබ පන්තියට ලියාපදිංචි කළ දුරකථන අංකය ඇතුළත් කර ශ්‍රී ලංකා තැපැල් (SL Post) හරහා ඔබේ Tute Pack එක මේ වන විට පවතින ස්ථානය සජීවීව දැනගන්න.
          </p>
        </div>

        {/* Tracking Search Component with History & Live SL Post Engine */}
        <TrackingSearch />

        {/* Service Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-12 pt-8 border-t border-zinc-200/70 dark:border-zinc-800/70">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">ක්ෂණික සෙවීම</div>
              <div className="text-[11px] text-zinc-500 font-medium">Ultra-fast direct DB lookup</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">Live SL Post Status</div>
              <div className="text-[11px] text-zinc-500 font-medium">Real-time domestic tracking</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">දත්ත රහස්‍යතාව</div>
              <div className="text-[11px] text-zinc-500 font-medium">Masked student privacy shield</div>
            </div>
          </div>
        </div>
      </main>

      {/* Public Footer (Never links to admin portal) */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 A/L Mass Media - Suranga Gamage. All rights reserved.</span>
          <span>Sri Lanka Post Domestic Postal Network</span>
        </div>
      </footer>
    </div>
  );
}
