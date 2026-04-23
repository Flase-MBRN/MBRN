import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

type RunStatus = "running" | "success" | "partial_failed" | "failed";

interface RawIngestItem {
  source_name?: string;
  source_item_id?: string | null;
  source_url: string;
  fetched_at: string;
  title?: string | null;
  payload: Record<string, unknown>;
  payload_hash: string;
}

interface RawIngestRequest {
  source_family: string;
  source_name: string;
  run_started_at: string;
  status?: RunStatus;
  error_count?: number;
  last_error?: string | null;
  metadata?: Record<string, unknown>;
  items: RawIngestItem[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Content-Type": "application/json",
};

const VALID_RUN_STATUSES: RunStatus[] = ["running", "success", "partial_failed", "failed"];

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin(): ReturnType<typeof createClient> {
  if (supabaseAdmin) return supabaseAdmin;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

function verifyBearerToken(req: Request): { valid: true } | { valid: false; error: string; code: string } {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { valid: false, error: "Missing Authorization header", code: "AUTH_MISSING" };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Invalid Authorization format. Use 'Bearer <token>'", code: "AUTH_FORMAT" };
  }

  const expectedApiKey = Deno.env.get("DATA_ARB_API_KEY");
  if (!expectedApiKey) {
    return { valid: false, error: "Server misconfiguration", code: "SERVER_CONFIG_ERROR" };
  }

  const token = authHeader.substring(7);
  if (!token || token !== expectedApiKey) {
    return { valid: false, error: "Invalid API key", code: "AUTH_INVALID" };
  }

  return { valid: true };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isIsoDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function validateItem(value: unknown): { valid: true; item: RawIngestItem } | { valid: false; error: string; code: string } {
  if (!isRecord(value)) {
    return { valid: false, error: "Item must be an object", code: "INVALID_ITEM" };
  }

  if (typeof value.source_url !== "string") {
    return { valid: false, error: "Item source_url must be a string", code: "INVALID_SOURCE_URL" };
  }

  if (typeof value.fetched_at !== "string" || !isIsoDate(value.fetched_at)) {
    return { valid: false, error: "Item fetched_at must be an ISO date string", code: "INVALID_FETCHED_AT" };
  }

  if (!isRecord(value.payload)) {
    return { valid: false, error: "Item payload must be an object", code: "INVALID_PAYLOAD" };
  }

  if (typeof value.payload_hash !== "string" || !value.payload_hash.trim()) {
    return { valid: false, error: "Item payload_hash must be a non-empty string", code: "INVALID_PAYLOAD_HASH" };
  }

  if (value.source_item_id !== undefined && value.source_item_id !== null && typeof value.source_item_id !== "string") {
    return { valid: false, error: "Item source_item_id must be a string when provided", code: "INVALID_SOURCE_ITEM_ID" };
  }

  if (value.source_name !== undefined && typeof value.source_name !== "string") {
    return { valid: false, error: "Item source_name must be a string when provided", code: "INVALID_SOURCE_NAME" };
  }

  if (value.title !== undefined && value.title !== null && typeof value.title !== "string") {
    return { valid: false, error: "Item title must be a string when provided", code: "INVALID_TITLE" };
  }

  return {
    valid: true,
    item: {
      source_name: typeof value.source_name === "string" ? value.source_name : undefined,
      source_item_id: typeof value.source_item_id === "string" ? value.source_item_id : null,
      source_url: value.source_url,
      fetched_at: value.fetched_at,
      title: typeof value.title === "string" ? value.title : null,
      payload: value.payload,
      payload_hash: value.payload_hash,
    },
  };
}

function validateBody(body: unknown): { valid: true; data: RawIngestRequest } | { valid: false; error: string; code: string } {
  if (!isRecord(body)) {
    return { valid: false, error: "Invalid JSON body", code: "INVALID_BODY" };
  }

  if (typeof body.source_family !== "string" || !body.source_family.trim()) {
    return { valid: false, error: "Field 'source_family' must be a non-empty string", code: "MISSING_SOURCE_FAMILY" };
  }

  if (typeof body.source_name !== "string" || !body.source_name.trim()) {
    return { valid: false, error: "Field 'source_name' must be a non-empty string", code: "MISSING_SOURCE_NAME" };
  }

  if (typeof body.run_started_at !== "string" || !isIsoDate(body.run_started_at)) {
    return { valid: false, error: "Field 'run_started_at' must be an ISO date string", code: "INVALID_RUN_STARTED_AT" };
  }

  if (!Array.isArray(body.items)) {
    return { valid: false, error: "Field 'items' must be an array", code: "INVALID_ITEMS" };
  }

  if (body.status !== undefined && (typeof body.status !== "string" || !VALID_RUN_STATUSES.includes(body.status as RunStatus))) {
    return { valid: false, error: "Field 'status' is invalid", code: "INVALID_STATUS" };
  }

  if (body.error_count !== undefined && typeof body.error_count !== "number") {
    return { valid: false, error: "Field 'error_count' must be a number", code: "INVALID_ERROR_COUNT" };
  }

  if (body.last_error !== undefined && body.last_error !== null && typeof body.last_error !== "string") {
    return { valid: false, error: "Field 'last_error' must be a string when provided", code: "INVALID_LAST_ERROR" };
  }

  if (body.metadata !== undefined && !isRecord(body.metadata)) {
    return { valid: false, error: "Field 'metadata' must be an object", code: "INVALID_METADATA" };
  }

  const items: RawIngestItem[] = [];
  for (const rawItem of body.items) {
    const itemValidation = validateItem(rawItem);
    if (!itemValidation.valid) {
      return itemValidation;
    }
    items.push(itemValidation.item);
  }

  return {
    valid: true,
    data: {
      source_family: body.source_family,
      source_name: body.source_name,
      run_started_at: body.run_started_at,
      status: (body.status as RunStatus | undefined) ?? "success",
      error_count: typeof body.error_count === "number" ? body.error_count : 0,
      last_error: typeof body.last_error === "string" ? body.last_error : null,
      metadata: isRecord(body.metadata) ? body.metadata : {},
      items,
    },
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed. Use POST.", code: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  const authCheck = verifyBearerToken(req);
  if (!authCheck.valid) {
    return new Response(JSON.stringify({ success: false, error: authCheck.error, code: authCheck.code }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const validation = validateBody(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ success: false, error: validation.error, code: validation.code }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = getSupabaseAdmin();
    const runInsert = await supabase
      .from("raw_ingest_runs")
      .insert({
        source_family: validation.data.source_family,
        source_name: validation.data.source_name,
        started_at: validation.data.run_started_at,
        status: "running",
        items_seen: validation.data.items.length,
        metadata: validation.data.metadata ?? {},
      })
      .select("id")
      .single();

    if (runInsert.error || !runInsert.data) {
      return new Response(JSON.stringify({ success: false, error: `Run insert failed: ${runInsert.error?.message ?? "unknown"}`, code: "RUN_INSERT_ERROR" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const runId = runInsert.data.id as string;
    let insertedCount = 0;
    let dedupedCount = 0;
    let errorCount = validation.data.error_count ?? 0;
    let lastError = validation.data.last_error ?? null;

    for (const item of validation.data.items) {
      let existingRecordId: string | null = null;

      if (item.source_item_id) {
        const existingBySource = await supabase
          .from("raw_ingest_items")
          .select("id")
          .eq("source_name", item.source_name ?? validation.data.source_name)
          .eq("source_item_id", item.source_item_id)
          .limit(1)
          .maybeSingle();

        if (existingBySource.error) {
          errorCount += 1;
          lastError = existingBySource.error.message;
          continue;
        }

        existingRecordId = existingBySource.data?.id ?? null;
      }

      if (!existingRecordId) {
        const existingByHash = await supabase
          .from("raw_ingest_items")
          .select("id")
          .eq("payload_hash", item.payload_hash)
          .limit(1)
          .maybeSingle();

        if (existingByHash.error) {
          errorCount += 1;
          lastError = existingByHash.error.message;
          continue;
        }

        existingRecordId = existingByHash.data?.id ?? null;
      }

      if (existingRecordId) {
        dedupedCount += 1;
        continue;
      }

      const insertItem = await supabase
        .from("raw_ingest_items")
        .insert({
          run_id: runId,
          source_family: validation.data.source_family,
          source_name: item.source_name ?? validation.data.source_name,
          source_item_id: item.source_item_id,
          source_url: item.source_url,
          fetched_at: item.fetched_at,
          title: item.title,
          payload: item.payload,
          payload_hash: item.payload_hash,
          ingest_status: "ingested",
        });

      if (insertItem.error) {
        errorCount += 1;
        lastError = insertItem.error.message;
        continue;
      }

      insertedCount += 1;
    }

    const finalStatus: RunStatus =
      errorCount > 0 && insertedCount === 0 && dedupedCount === 0
        ? "failed"
        : errorCount > 0 || validation.data.status === "partial_failed"
          ? "partial_failed"
          : validation.data.status ?? "success";

    const runUpdate = await supabase
      .from("raw_ingest_runs")
      .update({
        finished_at: new Date().toISOString(),
        status: finalStatus,
        items_inserted: insertedCount,
        error_count: errorCount,
        last_error: lastError,
      })
      .eq("id", runId);

    if (runUpdate.error) {
      return new Response(JSON.stringify({ success: false, error: `Run update failed: ${runUpdate.error.message}`, code: "RUN_UPDATE_ERROR" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      run_id: runId,
      received_count: validation.data.items.length,
      inserted_count: insertedCount,
      deduped_count: dedupedCount,
      error_count: errorCount,
      status: finalStatus,
    }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message, code: "INTERNAL_ERROR" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
