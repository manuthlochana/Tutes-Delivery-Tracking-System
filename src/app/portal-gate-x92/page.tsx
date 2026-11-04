"use client";

import React, { useState, useEffect, useTransition } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import {
  loginAdminAction,
  logoutAdminAction,
  verifyAdminSessionAction,
  uploadBatchAction,
  getBatchesAction,
  deleteBatchAction,
  purgeOldBatchesAction,
  BatchRecord,
  ParcelInsertItem,
} from "@/app/actions/admin";
import { cleanPhoneNumber } from "@/lib/phone";
import {
  Lock,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Layers,
  Calendar,
  LogOut,
  Clock,
  BookOpen,
} from "lucide-react";

interface ParsedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  headers: string[];
  rows: Record<string, unknown>[];
  phoneColumn: string;
  trackingColumn: string;
  year: number;
  month: string;
  materialType: string;
  monthTag: string;
  status: "ready" | "uploading" | "completed" | "error";
  progress: number;
  uploadedCount?: number;
  errorMessage?: string;
}

const MONTHS_LIST = [
  { value: "ජනවාරි", label: "ජනවාරි (January)" },
  { value: "පෙබරවාරි", label: "පෙබරවාරි (February)" },
  { value: "මාර්තු", label: "මාර්තු (March)" },
  { value: "අප්‍රේල්", label: "අප්‍රේල් (April)" },
  { value: "මැයි", label: "මැයි (May)" },
  { value: "ජූනි", label: "ජූනි (June)" },
  { value: "ජූලි", label: "ජූලි (July)" },
  { value: "අගෝස්තු", label: "අගෝස්තු (August)" },
  { value: "සැප්තැම්බර්", label: "සැප්තැම්බර් (September)" },
  { value: "ඔක්තෝබර්", label: "ඔක්තෝබර් (October)" },
  { value: "නොවැම්බර්", label: "නොවැම්බර් (November)" },
  { value: "දෙසැම්බර්", label: "දෙසැම්බර් (December)" },
];

const MATERIAL_TYPES = [
  "නිබන්ධන (Tute Pack)",
  "Revision Tutes",
  "Past Papers",
  "Model Papers",
  "Special Workshop Tute",
];

export default function AdminPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthPending, startAuthTransition] = useTransition();

  // Active portal tab: 'uploader' | 'batches'
  const [activeTab, setActiveTab] = useState<"uploader" | "batches">("uploader");

  // File Uploader state
  const [files, setFiles] = useState<ParsedFileItem[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [isUploadingAll, setIsUploadingAll] = useState(false);

  // Global batch defaults for quick multi-file configuration
  const currentYear = 2026;
  const [globalYear, setGlobalYear] = useState<number>(currentYear);
  const [globalMonth, setGlobalMonth] = useState<string>("නොවැම්බර්");
  const [globalMaterial, setGlobalMaterial] = useState<string>("නිබන්ධන (Tute Pack)");

  // Batches state
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [totalParcelsCount, setTotalParcelsCount] = useState<number>(0);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [purgeDays, setPurgeDays] = useState(30);
  const [batchActionMsg, setBatchActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadBatches = async () => {
    setIsLoadingBatches(true);
    setBatchActionMsg(null);
    try {
      const res = await getBatchesAction();
      if (res.success && res.batches) {
        setBatches(res.batches);
        setTotalParcelsCount(res.totalParcelsCount || 0);
      } else if (res.error) {
        setBatchActionMsg({ type: "error", text: res.error });
      }
    } catch {
      setBatchActionMsg({ type: "error", text: "Failed to load batches" });
    } finally {
      setIsLoadingBatches(false);
    }
  };

  // Check auth status on load
  useEffect(() => {
    async function checkAuth() {
      const res = await verifyAdminSessionAction();
      setIsAuthenticated(res.authenticated);
      if (res.authenticated) {
        loadBatches();
      }
    }
    checkAuth();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    startAuthTransition(async () => {
      const res = await loginAdminAction(passcode);
      if (res.success) {
        setIsAuthenticated(true);
        loadBatches();
      } else {
        setAuthError(res.error || "Authentication failed");
      }
    });
  };

  const handleLogout = async () => {
    await logoutAdminAction();
    setIsAuthenticated(false);
    setPasscode("");
    setFiles([]);
  };

  const buildTag = (year: number, month: string, material: string) => {
    const cleanMaterial = material.split(" ")[0]; // e.g. "නිබන්ධන"
    return `${year} ${month} ${cleanMaterial}`;
  };

  // Header column auto-detect heuristics
  const detectPhoneColumn = (headers: string[]): string => {
    const phoneRegex = /phone|mobile|tel|contact|cell|tp|number|අංකය|දුරකථන/i;
    const match = headers.find((h) => phoneRegex.test(h));
    return match || headers[0] || "";
  };

  const detectTrackingColumn = (headers: string[]): string => {
    const trackingRegex = /track|bg|code|waybill|barcode|postal|delivery|slip|කේතය/i;
    const match = headers.find((h) => trackingRegex.test(h));
    if (match) return match;
    return headers.length > 1 ? headers[1] : headers[0] || "";
  };

  // Handle multi-file selection (supports 5 to 6 files simultaneously)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsProcessingFiles(true);
    const newItems: ParsedFileItem[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const ext = file.name.split(".").pop()?.toLowerCase();

      try {
        let headers: string[] = [];
        let rows: Record<string, unknown>[] = [];

        if (ext === "csv") {
          const text = await file.text();
          const parsed = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
          });
          headers = parsed.meta.fields || [];
          rows = parsed.data as Record<string, unknown>[];
        } else if (ext === "xlsx" || ext === "xls") {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
            defval: "",
          });
          if (jsonData.length > 0) {
            headers = Object.keys(jsonData[0]);
            rows = jsonData;
          }
        }

        if (headers.length > 0) {
          const y = globalYear;
          const m = globalMonth;
          const mat = globalMaterial;

          newItems.push({
            id: `${file.name}-${Date.now()}-${i}`,
            file,
            name: file.name,
            size: file.size,
            headers,
            rows,
            phoneColumn: detectPhoneColumn(headers),
            trackingColumn: detectTrackingColumn(headers),
            year: y,
            month: m,
            materialType: mat,
            monthTag: buildTag(y, m, mat),
            status: "ready",
            progress: 0,
          });
        }
      } catch (err) {
        console.error("Failed to parse file:", file.name, err);
      }
    }

    setFiles((prev) => [...prev, ...newItems]);
    setIsProcessingFiles(false);
    e.target.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileMeta = (
    id: string,
    updates: Partial<Pick<ParsedFileItem, "phoneColumn" | "trackingColumn" | "year" | "month" | "materialType">>
  ) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const newYear = updates.year !== undefined ? updates.year : f.year;
        const newMonth = updates.month !== undefined ? updates.month : f.month;
        const newMat = updates.materialType !== undefined ? updates.materialType : f.materialType;
        return {
          ...f,
          ...updates,
          year: newYear,
          month: newMonth,
          materialType: newMat,
          monthTag: buildTag(newYear, newMonth, newMat),
        };
      })
    );
  };

  const applyGlobalConfigToAll = () => {
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        year: globalYear,
        month: globalMonth,
        materialType: globalMaterial,
        monthTag: buildTag(globalYear, globalMonth, globalMaterial),
      }))
    );
  };

  // Upload single file
  const uploadSingleFile = async (item: ParsedFileItem): Promise<boolean> => {
    if (!item.phoneColumn || !item.trackingColumn) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: "error", errorMessage: "Phone and Tracking columns are required." }
            : f
        )
      );
      return false;
    }

    setFiles((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: "uploading", progress: 10 } : f))
    );

    const parcels: ParcelInsertItem[] = [];
    for (const row of item.rows) {
      const rawPhone = String(row[item.phoneColumn] || "").trim();
      const rawTracking = String(row[item.trackingColumn] || "").trim();

      if (!rawPhone || !rawTracking) continue;

      const cleanPhone = cleanPhoneNumber(rawPhone);
      if (cleanPhone) {
        parcels.push({
          raw_phone: rawPhone,
          clean_phone: cleanPhone,
          tracking_code: rawTracking,
          month_tag: item.monthTag,
          status: "Dispatched",
        });
      }
    }

    if (parcels.length === 0) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: "error", errorMessage: "No valid rows with phone and tracking codes found." }
            : f
        )
      );
      return false;
    }

    setFiles((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, progress: 40 } : f))
    );

    const res = await uploadBatchAction({
      filename: item.name,
      month_tag: item.monthTag,
      parcels,
    });

    if (res.success) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: "completed", progress: 100, uploadedCount: res.insertedCount }
            : f
        )
      );
      return true;
    } else {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: "error", errorMessage: res.error || "Upload failed." }
            : f
        )
      );
      return false;
    }
  };

  // Upload all queued files
  const handleUploadAll = async () => {
    const readyFiles = files.filter((f) => f.status === "ready" || f.status === "error");
    if (readyFiles.length === 0) return;

    setIsUploadingAll(true);
    let completed = 0;

    for (let i = 0; i < readyFiles.length; i++) {
      const item = readyFiles[i];
      await uploadSingleFile(item);
      completed++;
      setOverallProgress(Math.round((completed / readyFiles.length) * 100));
    }

    setIsUploadingAll(false);
    loadBatches();
  };

  // Batch deletion
  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm("Are you sure you want to delete this batch and all its parcels?")) return;
    const res = await deleteBatchAction(batchId);
    if (res.success) {
      setBatchActionMsg({ type: "success", text: "Batch deleted successfully." });
      loadBatches();
    } else {
      setBatchActionMsg({ type: "error", text: res.error || "Failed to delete batch." });
    }
  };

  // Purge old batches
  const handlePurgeOld = async () => {
    if (!confirm(`Are you sure you want to permanently purge batches older than ${purgeDays} days?`)) {
      return;
    }
    const res = await purgeOldBatchesAction(purgeDays);
    if (res.success) {
      setBatchActionMsg({ type: "success", text: res.message || "Purge completed." });
      loadBatches();
    } else {
      setBatchActionMsg({ type: "error", text: res.error || "Failed to purge old batches." });
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Passcode Gatekeeper
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Admin Gate &bull; Suranga Gamage Media</h1>
            <p className="text-xs text-zinc-400">
              Enter secret passcode to access batch manager and SL Post dispatch upload system.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Admin Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode..."
                required
                className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono tracking-wider"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthPending || !passcode}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              {isAuthPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Authorize & Unlock</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>Suranga Gamage Media &bull; Tute Dispatch</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  SL Post Bulk Manager
                </span>
              </div>
              <div className="text-[11px] text-zinc-400">
                Total Live Parcels: <span className="font-semibold text-emerald-400">{totalParcelsCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-zinc-800/60 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6">
          <button
            onClick={() => setActiveTab("uploader")}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "uploader"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Multi-File Uploader ({files.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("batches");
              loadBatches();
            }}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "batches"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Uploaded Batches ({batches.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Tab 1: Multi-File Uploader with Month/Year Pickers */}
        {activeTab === "uploader" && (
          <div className="space-y-6">
            {/* Global Month/Year Batch Picker Bar */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Calendar className="w-4 h-4" />
                  <span>Batch Tag Selector (Year & Month Pickers)</span>
                </div>
                {files.length > 0 && (
                  <button
                    onClick={applyGlobalConfigToAll}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline"
                  >
                    Apply to all {files.length} queued files
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                {/* Year Select */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Year (වර්ෂය)
                  </label>
                  <select
                    value={globalYear}
                    onChange={(e) => setGlobalYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {[2025, 2026, 2027, 2028].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month Select */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Month (අදාළ මාසය)
                  </label>
                  <select
                    value={globalMonth}
                    onChange={(e) => setGlobalMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {MONTHS_LIST.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Material Type */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Material Type (කාණ්ඩය)
                  </label>
                  <select
                    value={globalMaterial}
                    onChange={(e) => setGlobalMaterial(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {MATERIAL_TYPES.map((mat) => (
                      <option key={mat} value={mat}>
                        {mat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Generated Batch Tag Preview */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Generated Batch Tag
                  </label>
                  <div className="px-3 py-2 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-xs font-bold text-emerald-400 font-mono truncate">
                    {buildTag(globalYear, globalMonth, globalMaterial)}
                  </div>
                </div>
              </div>
            </div>

            {/* File Dropzone */}
            <div className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-8 text-center bg-zinc-900/30 hover:bg-zinc-900/60 transition-all cursor-pointer relative">
              <input
                type="file"
                multiple
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={isProcessingFiles || isUploadingAll}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Select 5 to 6 Excel (`.xlsx`, `.xls`) or `.csv` files
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Drag and drop or click to browse. Files can have different headers.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-[11px] font-semibold text-zinc-300">
                  <span>Auto-detects phone & SL Post tracking barcode columns</span>
                </div>
              </div>
            </div>

            {/* Selected Files Header & Upload All Button */}
            {files.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
                <div className="text-xs text-zinc-400">
                  <span className="font-bold text-white text-sm">{files.length} File(s)</span> ready for column confirmation and Supabase upload.
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFiles([])}
                    disabled={isUploadingAll}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                  >
                    Clear All
                  </button>

                  <button
                    onClick={handleUploadAll}
                    disabled={isUploadingAll || files.every((f) => f.status === "completed")}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/40 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isUploadingAll ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Uploading ({overallProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload All Batches to Supabase</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Overall Progress Bar */}
            {isUploadingAll && (
              <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                <div
                  className="bg-emerald-500 h-2.5 transition-all duration-300 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            )}

            {/* File Cards with Dynamic Column Mapping & Month Pickers */}
            <div className="space-y-4">
              {files.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 transition-all"
                >
                  {/* File Title and Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            ({(item.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400">
                          {item.rows.length.toLocaleString()} total rows detected
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.status === "completed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Uploaded ({item.uploadedCount || item.rows.length} records)</span>
                        </span>
                      )}

                      {item.status === "uploading" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-xs font-semibold">
                          <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                          <span>Processing...</span>
                        </span>
                      )}

                      {item.status === "error" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Error</span>
                        </span>
                      )}

                      {item.status === "ready" && (
                        <button
                          onClick={() => uploadSingleFile(item)}
                          disabled={isUploadingAll}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload File</span>
                        </button>
                      )}

                      <button
                        onClick={() => removeFile(item.id)}
                        disabled={item.status === "uploading"}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Error display */}
                  {item.errorMessage && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{item.errorMessage}</span>
                    </div>
                  )}

                  {/* Column Mapping & Month Tag Customizers */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                    {/* Dropdown 1: Phone Column */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Phone Column
                      </label>
                      <select
                        value={item.phoneColumn}
                        onChange={(e) => updateFileMeta(item.id, { phoneColumn: e.target.value })}
                        disabled={item.status === "completed" || item.status === "uploading"}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl text-xs font-medium text-white focus:outline-none"
                      >
                        {item.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        Auto: <span className="text-zinc-300 font-mono">{item.phoneColumn}</span>
                      </div>
                    </div>

                    {/* Dropdown 2: Tracking Column */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Tracking / BG Code Column
                      </label>
                      <select
                        value={item.trackingColumn}
                        onChange={(e) => updateFileMeta(item.id, { trackingColumn: e.target.value })}
                        disabled={item.status === "completed" || item.status === "uploading"}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl text-xs font-medium text-white focus:outline-none"
                      >
                        {item.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        Auto: <span className="text-zinc-300 font-mono">{item.trackingColumn}</span>
                      </div>
                    </div>

                    {/* File-specific Month Picker */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Month Selection
                      </label>
                      <select
                        value={item.month}
                        onChange={(e) => updateFileMeta(item.id, { month: e.target.value })}
                        disabled={item.status === "completed" || item.status === "uploading"}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl text-xs font-medium text-white focus:outline-none"
                      >
                        {MONTHS_LIST.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        Year: <span className="font-semibold text-zinc-300">{item.year}</span>
                      </div>
                    </div>

                    {/* Final Batch Tag Preview */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Final Batch Tag
                      </label>
                      <input
                        type="text"
                        value={item.monthTag}
                        onChange={(e) =>
                          setFiles((prev) =>
                            prev.map((f) => (f.id === item.id ? { ...f, monthTag: e.target.value } : f))
                          )
                        }
                        disabled={item.status === "completed" || item.status === "uploading"}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl text-xs font-bold text-emerald-400 font-mono focus:outline-none"
                      />
                      <div className="text-[10px] text-zinc-500 mt-1">
                        Editable tag
                      </div>
                    </div>
                  </div>

                  {/* Data Preview */}
                  <div className="mt-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 overflow-x-auto text-[11px]">
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Sample Data Preview (First {Math.min(item.rows.length, 3)} rows):
                    </div>
                    <table className="w-full text-left font-mono">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400">
                          <th className="pb-1.5 pr-4 font-semibold">#</th>
                          <th className="pb-1.5 pr-4 font-semibold text-emerald-400">
                            Phone ({item.phoneColumn})
                          </th>
                          <th className="pb-1.5 pr-4 font-semibold text-teal-400">
                            Tracking ({item.trackingColumn})
                          </th>
                          <th className="pb-1.5 font-semibold text-zinc-500">Normalized Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {item.rows.slice(0, 3).map((r, rIdx) => {
                          const rawPhone = String(r[item.phoneColumn] || "");
                          const rawCode = String(r[item.trackingColumn] || "");
                          const norm = cleanPhoneNumber(rawPhone);
                          return (
                            <tr key={rIdx} className="text-zinc-300">
                              <td className="py-1.5 pr-4 text-zinc-600">{rIdx + 1}</td>
                              <td className="py-1.5 pr-4 font-semibold text-emerald-300">{rawPhone}</td>
                              <td className="py-1.5 pr-4 font-semibold text-teal-300">{rawCode}</td>
                              <td className="py-1.5 text-zinc-400">{norm || "Invalid"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Uploaded Batches & Purge Old Data */}
        {activeTab === "batches" && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={loadBatches}
                  disabled={isLoadingBatches}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBatches ? "animate-spin" : ""}`} />
                  <span>Refresh Batches</span>
                </button>

                <div className="text-xs text-zinc-400">
                  <span className="font-bold text-white">{batches.length}</span> batches &bull;{" "}
                  <span className="font-bold text-emerald-400">{totalParcelsCount.toLocaleString()}</span> parcels
                </div>
              </div>

              {/* Purge older than X days */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Older than:</span>
                  <select
                    value={purgeDays}
                    onChange={(e) => setPurgeDays(Number(e.target.value))}
                    className="bg-transparent text-white font-semibold focus:outline-none"
                  >
                    <option value={30}>30 Days</option>
                    <option value={60}>60 Days</option>
                    <option value={90}>90 Days</option>
                  </select>
                </div>

                <button
                  onClick={handlePurgeOld}
                  className="px-4 py-2 bg-red-950/60 hover:bg-red-900/60 border border-red-800/80 text-red-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Old Batches</span>
                </button>
              </div>
            </div>

            {/* Action message */}
            {batchActionMsg && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  batchActionMsg.type === "success"
                    ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-400"
                    : "bg-red-950/40 border-red-900/60 text-red-400"
                }`}
              >
                {batchActionMsg.type === "success" ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{batchActionMsg.text}</span>
              </div>
            )}

            {/* Batches Table */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
              {batches.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 text-sm">
                  {isLoadingBatches ? "Loading batches from Supabase..." : "No batches uploaded yet. Go to Uploader tab to upload files."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Filename</th>
                        <th className="py-3 px-4">Month / Batch Tag</th>
                        <th className="py-3 px-4">Record Count</th>
                        <th className="py-3 px-4">Uploaded At</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {batches.map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{b.filename}</span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-300">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-800 font-medium">
                              <Calendar className="w-3 h-3 text-zinc-400" />
                              {b.month_tag}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-emerald-400">
                              {b.total_records.toLocaleString()}
                            </span>{" "}
                            parcels
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                            {new Date(b.uploaded_at).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteBatch(b.id)}
                              className="px-2.5 py-1 text-red-400 hover:text-white hover:bg-red-950/80 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
