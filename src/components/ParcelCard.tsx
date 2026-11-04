"use client";

import React, { useState, useEffect } from "react";
import { ParcelSearchResult, getLiveTrackingAction } from "@/app/actions/tracking";
import { SLPostTrackingResult } from "@/lib/slpost";
import {
  translateEventDescription,
  translateStatus,
} from "@/lib/sinhala-translations";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MapPin,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface ParcelCardProps {
  parcel: ParcelSearchResult;
  isLatest: boolean;
  index: number;
}

export function ParcelCard({ parcel, isLatest }: ParcelCardProps) {
  const [isExpanded, setIsExpanded] = useState(isLatest);
  const [liveStatus, setLiveStatus] = useState<SLPostTrackingResult | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchLiveTracking = async () => {
    setIsLoadingLive(true);
    setHasFetched(true);
    try {
      const res = await getLiveTrackingAction(parcel.tracking_code);
      setLiveStatus(res);
    } catch {
      setLiveStatus({
        barcode: parcel.tracking_code,
        status: "Not Found",
        events: [],
        error: "Failed to fetch live events",
      });
    } finally {
      setIsLoadingLive(false);
    }
  };

  // Fetch live SL Post status when expanded
  useEffect(() => {
    if (isExpanded && !hasFetched && parcel.tracking_code) {
      const timer = setTimeout(() => {
        fetchLiveTracking();
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, hasFetched, parcel.tracking_code]);

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(parcel.tracking_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Status badge config (100% Sinhala mapping)
  const getStatusBadge = () => {
    if (isLoadingLive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping shrink-0" />
          <span>පරීක්ෂා කරමින්...</span>
        </span>
      );
    }

    const currentStatus = liveStatus?.status || parcel.status || "Dispatched";
    const sinhalaStatus = translateStatus(currentStatus);

    if (currentStatus === "Delivered") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{sinhalaStatus}</span>
        </span>
      );
    }

    if (currentStatus === "Out for Delivery") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800">
          <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{sinhalaStatus}</span>
        </span>
      );
    }

    if (currentStatus === "In Transit") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 text-xs font-bold border border-cyan-300 dark:border-cyan-800">
          <Truck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>{sinhalaStatus}</span>
        </span>
      );
    }

    if (currentStatus === "Dispatched") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 text-xs font-bold border border-purple-300 dark:border-purple-800">
          <Package className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>{sinhalaStatus}</span>
        </span>
      );
    }

    // Default Not Found / System updating
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold">
        <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <span>{sinhalaStatus}</span>
      </span>
    );
  };

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-200 ${
        isLatest
          ? "bg-white dark:bg-zinc-900 border-2 border-emerald-500/40 shadow-lg dark:shadow-black/40"
          : "bg-white/90 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
      }`}
    >
      {/* Card Header / Summary Row - Tap anywhere to expand */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isLatest
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <Package className="w-5 h-5" />
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
                {parcel.month_tag || "නිබන්ධන කට්ටලය"}
              </span>
              {isLatest && (
                <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>නවතම පාර්සලය</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono flex-wrap">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {parcel.tracking_code}
              </span>
              <span>&bull;</span>
              <span>{parcel.masked_phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
          <div>{getStatusBadge()}</div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={copyToClipboard}
              className={`p-2 rounded-lg text-xs font-semibold transition-all min-w-[36px] min-h-[36px] flex items-center justify-center ${
                copiedCode
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
              }`}
              title="අංකය පිටපත් කරන්න"
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Live SL Post Tracking History */}
      {isExpanded && (
        <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
          {/* Tracking Barcode Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800">
            <div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                තැපැල් ලියාපදිංචි අංකය (BARCODE)
              </div>
              <div className="text-lg sm:text-xl font-black font-mono tracking-tight text-zinc-900 dark:text-white mt-0.5 break-all">
                {parcel.tracking_code}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex-1 sm:flex-none py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>පිටපත් විය!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>අංකය පිටපත් කරන්න</span>
                  </>
                )}
              </button>

              <a
                href="https://slpmail.slpost.gov.lk/track/index.php"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 min-h-[40px]"
                title="SL Post වෙබ් අඩවිය"
              >
                <span>SL Post</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Live SL Post Tracking Timeline Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-500" />
                <span>තැපැල් ගමන් විස්තරය (LIVE STATUS)</span>
              </h4>
              {liveStatus?.cached && (
                <span className="text-[10px] text-zinc-400 font-mono">
                  (මතකයේ සුරැකිණි)
                </span>
              )}
            </div>

            {/* Loading Skeleton */}
            {isLoadingLive && (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shrink-0" />
                  <span>තැපැල් දෙපාර්තමේන්තුවෙන් සජීවී තොරතුරු ලබාගනිමින් පවතී...</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 animate-pulse" />
                  <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            )}

            {/* Loaded Events Timeline - Mobile optimized single-column layout */}
            {!isLoadingLive && liveStatus && liveStatus.events && liveStatus.events.length > 0 && (
              <div className="relative pl-5 sm:pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
                {liveStatus.events.map((evt, eIdx) => {
                  const isLatestEvent = eIdx === liveStatus.events.length - 1;
                  const sinhalaEventTitle = translateEventDescription(evt.description);

                  return (
                    <div key={eIdx} className="relative group">
                      {/* Timeline Node Bullet */}
                      <div
                        className={`absolute -left-5 sm:-left-6 top-1.5 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                          isLatestEvent
                            ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20"
                            : "bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {isLatestEvent ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        ) : (
                          <div className="w-1 h-1 rounded-full bg-zinc-100" />
                        )}
                      </div>

                      {/* Event Detail Card */}
                      <div
                        className={`p-3 rounded-xl border transition-all ${
                          isLatestEvent
                            ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
                            : "bg-zinc-50/70 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800/60"
                        }`}
                      >
                        {/* Event Title in 100% Sinhala */}
                        <div
                          className={`font-bold text-xs sm:text-sm leading-snug ${
                            isLatestEvent
                              ? "text-emerald-800 dark:text-emerald-300"
                              : "text-zinc-800 dark:text-zinc-200"
                          }`}
                        >
                          {sinhalaEventTitle}
                        </div>

                        {/* Location and Date stacked underneath */}
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                          {evt.location && (
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span>{evt.location}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-mono text-zinc-400">
                            <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span>{evt.date}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty Events or No Live Info Available */}
            {!isLoadingLive && liveStatus && (!liveStatus.events || liveStatus.events.length === 0) && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 leading-relaxed">
                  <div className="font-bold">
                    තැපැල් කාර්යාලයට භාරදී ඇත, System එකේ යාවත්කාලීන වෙමින් පවතී.
                  </div>
                  <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                    තැපැල් කාර්යාලයේ දත්ත පද්ධතියට මෙම බාර්කෝඩය ඇතුළත් වූ වහාම බෙදාහැරීමේ සම්පූර්ණ තොරතුරු මෙතැනින් දිස්වනු ඇත.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
