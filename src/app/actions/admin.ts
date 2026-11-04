"use server";

import { createAdminClient } from "@/lib/supabase/server";
import {
  verifyPasscode,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  checkIsAdminAuthenticated,
} from "@/lib/auth";

export interface BatchRecord {
  id: string;
  filename: string;
  month_tag: string;
  total_records: number;
  uploaded_at: string;
}

export interface ParcelInsertItem {
  raw_phone: string;
  clean_phone: string;
  tracking_code: string;
  month_tag: string;
  status?: string;
}

// 1. Auth Actions
export async function loginAdminAction(passcode: string) {
  if (!verifyPasscode(passcode)) {
    return { success: false, error: "Invalid Passcode. Access denied." };
  }

  await setAdminSessionCookie();
  return { success: true };
}

export async function logoutAdminAction() {
  await clearAdminSessionCookie();
  return { success: true };
}

export async function verifyAdminSessionAction() {
  const isAuth = await checkIsAdminAuthenticated();
  return { authenticated: isAuth };
}

// 2. Upload Batch Action
export async function uploadBatchAction(payload: {
  filename: string;
  month_tag: string;
  parcels: ParcelInsertItem[];
}) {
  const isAuth = await checkIsAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: "Unauthorized. Please login again." };
  }

  const { filename, month_tag, parcels } = payload;
  if (!filename || !month_tag || !Array.isArray(parcels) || parcels.length === 0) {
    return { success: false, error: "Invalid payload: no parcels provided." };
  }

  const supabase = createAdminClient();

  try {
    // 1. Insert Batch record
    const { data: batch, error: batchError } = await supabase
      .from("upload_batches")
      .insert({
        filename,
        month_tag,
        total_records: parcels.length,
      })
      .select("id")
      .single();

    if (batchError || !batch) {
      console.error("Batch insert error:", batchError);
      return { success: false, error: `Failed to create batch: ${batchError?.message}` };
    }

    const batchId = batch.id;
    const CHUNK_SIZE = 500;
    let insertedCount = 0;

    // 2. Insert parcels in chunks of 500
    for (let i = 0; i < parcels.length; i += CHUNK_SIZE) {
      const chunk = parcels.slice(i, i + CHUNK_SIZE).map((p) => ({
        batch_id: batchId,
        raw_phone: String(p.raw_phone || "").trim(),
        clean_phone: String(p.clean_phone || "").trim(),
        tracking_code: String(p.tracking_code || "").trim(),
        month_tag: String(p.month_tag || month_tag).trim(),
        status: p.status || "Dispatched",
      }));

      const { error: insertError } = await supabase.from("parcels").insert(chunk);

      if (insertError) {
        console.error(`Error inserting chunk ${i} to ${i + CHUNK_SIZE}:`, insertError);
        // Delete incomplete batch to maintain consistency
        await supabase.from("upload_batches").delete().eq("id", batchId);
        return {
          success: false,
          error: `Error inserting parcel records: ${insertError.message}`,
        };
      }

      insertedCount += chunk.length;
    }

    return {
      success: true,
      batchId,
      insertedCount,
      message: `Successfully uploaded ${insertedCount} records for ${filename}`,
    };
  } catch (err: unknown) {
    console.error("uploadBatchAction exception:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Internal server error during upload",
    };
  }
}

// 3. Batch Management Actions
export async function getBatchesAction() {
  const isAuth = await checkIsAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: "Unauthorized." };
  }

  const supabase = createAdminClient();

  try {
    const { data: batches, error } = await supabase
      .from("upload_batches")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Get total count of parcels
    const { count } = await supabase
      .from("parcels")
      .select("*", { count: "exact", head: true });

    return {
      success: true,
      batches: (batches || []) as BatchRecord[],
      totalParcelsCount: count || 0,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error fetching batches",
    };
  }
}

export async function deleteBatchAction(batchId: string) {
  const isAuth = await checkIsAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: "Unauthorized." };
  }

  const supabase = createAdminClient();

  try {
    const { error } = await supabase.from("upload_batches").delete().eq("id", batchId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error deleting batch",
    };
  }
}

export async function purgeOldBatchesAction(daysOlderThan: number = 30) {
  const isAuth = await checkIsAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: "Unauthorized." };
  }

  const supabase = createAdminClient();

  try {
    const cutoffDate = new Date(Date.now() - daysOlderThan * 24 * 60 * 60 * 1000).toISOString();

    const { data: oldBatches, error: findError } = await supabase
      .from("upload_batches")
      .select("id, filename")
      .lt("uploaded_at", cutoffDate);

    if (findError) {
      return { success: false, error: findError.message };
    }

    if (!oldBatches || oldBatches.length === 0) {
      return {
        success: true,
        purgedCount: 0,
        message: `No batches found older than ${daysOlderThan} days.`,
      };
    }

    const ids = oldBatches.map((b) => b.id);
    const { error: deleteError } = await supabase.from("upload_batches").delete().in("id", ids);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return {
      success: true,
      purgedCount: oldBatches.length,
      message: `Successfully purged ${oldBatches.length} batch(es) older than ${daysOlderThan} days.`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error purging old batches",
    };
  }
}
