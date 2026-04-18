// MBRN-HUB-V1: Pillar 2 - B2B IDLE API
// Supabase Edge Function: market_sentiment
// Receives sentiment data from Python Data Arbitrage (Pillar 3)
// Phase 5.3 - CLOUD LOCKDOWN (Enterprise-Ready)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// === SINGLETONE: Supabase Admin Client (Performance Optimization) ===
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

// === RATE LIMITING (Cloud-Lockdown: Max 10 requests per minute per IP) ===
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

function checkRateLimit(ip: string): { allowed: true } | { allowed: false; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    // New window or expired
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  entry.count++;
  return { allowed: true };
}

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

// === CORS WHITELIST (Security Hardening) ===
const ALLOWED_ORIGINS = [
  "https://flase-mbrn.github.io",
  "http://localhost:3000",
  "http://localhost:8080",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0]; // Default to production URL

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
    "Content-Type": "application/json",
  };
}

// Legacy V1 payload shape:
// { "source": "market_sentiment_pipeline", "sentiment_score": 85, "verdict": "Extreme Greed" }
interface SentimentPayload {
  source: string;
  sentiment_score: number;
  verdict: string;
}

interface GenericSignalPayload {
  timestamp?: string;
  source: string;
  signal_type: "market_sentiment" | "credibility" | "impact" | "alert_level";
  normalized_score: number;
  verdict: string;
  confidence?: number;
  summary?: string;
  dimensions?: Record<string, unknown>;
  raw_data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface NormalizedPayload extends SentimentPayload {
  timestamp: string;
  signal_type: GenericSignalPayload["signal_type"];
  normalized_score: number;
  confidence?: number;
  summary?: string;
  dimensions?: Record<string, unknown>;
  raw_data: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// Structured Return Pattern (MBRN Law 4)
interface SuccessResponse {
  success: true;
  received_score: number;
  source: string;
  verdict: string;
  timestamp: string;
  id: string;
}

interface DatabaseRecord {
  id: string;
  timestamp: string;
  source: string;
  sentiment_score: number;
  verdict: string;
  raw_data: Record<string, unknown>;
}

interface ErrorResponse {
  success: false;
  error: string;
  code: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

// Validation constants (No Magic Numbers - MBRN Law 8)
const VALIDATION = {
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  MAX_SOURCE_LENGTH: 100,
  MAX_VERDICT_LENGTH: 50,
};

const SOURCE_PATTERN = /^[a-z0-9][a-z0-9_-]{2,99}$/;
const ALLOWED_SIGNAL_TYPES = [
  "market_sentiment",
  "credibility",
  "impact",
  "alert_level",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function validateScore(score: number): { valid: true } | { valid: false; error: string; code: string } {
  if (score < VALIDATION.MIN_SCORE || score > VALIDATION.MAX_SCORE) {
    return {
      valid: false,
      error: `Score must be between ${VALIDATION.MIN_SCORE} and ${VALIDATION.MAX_SCORE}`,
      code: "SCORE_OUT_OF_RANGE",
    };
  }

  return { valid: true };
}

function normalizePayload(body: unknown): { valid: true; data: NormalizedPayload } | { valid: false; error: string; code: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON body", code: "INVALID_BODY" };
  }

  const payload = body as Record<string, unknown>;

  // Check required fields
  if (typeof payload.source !== "string") {
    return { valid: false, error: "Field 'source' must be a string", code: "MISSING_SOURCE" };
  }

  if (typeof payload.verdict !== "string") {
    return { valid: false, error: "Field 'verdict' must be a string", code: "MISSING_VERDICT" };
  }

  // Validate source
  if (payload.source.length > VALIDATION.MAX_SOURCE_LENGTH) {
    return { valid: false, error: `Source too long (max ${VALIDATION.MAX_SOURCE_LENGTH} chars)`, code: "SOURCE_TOO_LONG" };
  }

  if (!SOURCE_PATTERN.test(payload.source)) {
    return {
      valid: false,
      error: "Source must match /^[a-z0-9][a-z0-9_-]{2,99}$/",
      code: "INVALID_SOURCE",
    };
  }

  // Validate verdict
  if (payload.verdict.length > VALIDATION.MAX_VERDICT_LENGTH) {
    return { valid: false, error: `Verdict too long (max ${VALIDATION.MAX_VERDICT_LENGTH} chars)`, code: "VERDICT_TOO_LONG" };
  }

  const timestamp = typeof payload.timestamp === "string"
    ? payload.timestamp
    : new Date().toISOString();

  const rawData = isRecord(payload.raw_data)
    ? payload.raw_data
    : payload;

  const metadata = isRecord(payload.metadata)
    ? payload.metadata
    : {};

  const confidence = typeof payload.confidence === "number"
    ? payload.confidence
    : undefined;

  const summary = typeof payload.summary === "string"
    ? payload.summary
    : undefined;

  const dimensions = isRecord(payload.dimensions)
    ? payload.dimensions
    : undefined;

  if (typeof payload.signal_type === "string" || typeof payload.normalized_score === "number") {
    if (typeof payload.signal_type !== "string") {
      return { valid: false, error: "Field 'signal_type' must be a string", code: "MISSING_SIGNAL_TYPE" };
    }

    if (!ALLOWED_SIGNAL_TYPES.includes(payload.signal_type as GenericSignalPayload["signal_type"])) {
      return {
        valid: false,
        error: `Unsupported signal_type. Allowed: ${ALLOWED_SIGNAL_TYPES.join(", ")}`,
        code: "INVALID_SIGNAL_TYPE",
      };
    }

    if (typeof payload.normalized_score !== "number") {
      return { valid: false, error: "Field 'normalized_score' must be a number", code: "MISSING_SCORE" };
    }

    const scoreValidation = validateScore(payload.normalized_score);
    if (!scoreValidation.valid) {
      return scoreValidation;
    }

    return {
      valid: true,
      data: {
        timestamp,
        source: payload.source,
        signal_type: payload.signal_type as GenericSignalPayload["signal_type"],
        normalized_score: payload.normalized_score,
        sentiment_score: payload.normalized_score,
        verdict: payload.verdict,
        confidence,
        summary,
        dimensions,
        raw_data: rawData,
        metadata,
      },
    };
  }

  if (typeof payload.sentiment_score !== "number") {
    return { valid: false, error: "Field 'sentiment_score' must be a number", code: "MISSING_SCORE" };
  }

  const legacyScoreValidation = validateScore(payload.sentiment_score);
  if (!legacyScoreValidation.valid) {
    return legacyScoreValidation;
  }

  return {
    valid: true,
    data: {
      timestamp,
      source: payload.source,
      signal_type: "market_sentiment",
      normalized_score: payload.sentiment_score,
      sentiment_score: payload.sentiment_score,
      verdict: payload.verdict,
      confidence,
      summary,
      dimensions,
      raw_data: rawData,
      metadata,
    },
  };
}

// Bearer Token Verification (Cloud-Lockdown: Validates against DATA_ARB_API_KEY)
function verifyBearerToken(req: Request): { valid: true } | { valid: false; error: string; code: string } {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    console.error("[AUTH] Request rejected: Missing Authorization header");
    return { valid: false, error: "Missing Authorization header", code: "AUTH_MISSING" };
  }

  if (!authHeader.startsWith("Bearer ")) {
    console.error("[AUTH] Request rejected: Invalid Authorization format");
    return { valid: false, error: "Invalid Authorization format. Use 'Bearer <token>'", code: "AUTH_FORMAT" };
  }

  const token = authHeader.substring(7);
  const expectedApiKey = Deno.env.get("DATA_ARB_API_KEY");

  if (!expectedApiKey) {
    console.error("[AUTH] Server misconfiguration: DATA_ARB_API_KEY not set");
    return { valid: false, error: "Server misconfiguration", code: "SERVER_CONFIG_ERROR" };
  }

  if (!token || token !== expectedApiKey) {
    // Log truncated token for debugging, never log full token
    const truncatedToken = token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : "null";
    console.error(`[AUTH] Request rejected: Invalid API key (received: ${truncatedToken})`);
    return { valid: false, error: "Invalid API key", code: "AUTH_INVALID" };
  }

  return { valid: true };
}

function createSuccessResponse(data: SentimentPayload, id: string): SuccessResponse {
  return {
    success: true,
    received_score: data.sentiment_score,
    source: data.source,
    verdict: data.verdict,
    timestamp: new Date().toISOString(),
    id,
  };
}

function createErrorResponse(error: string, code: string): ErrorResponse {
  return {
    success: false,
    error,
    code,
  };
}

serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    console.error(`[REQUEST] Method ${req.method} rejected from origin: ${origin || "unknown"}`);
    const response: ErrorResponse = createErrorResponse("Method not allowed. Use POST.", "METHOD_NOT_ALLOWED");
    return new Response(JSON.stringify(response), {
      status: 405,
      headers: corsHeaders,
    });
  }

  // === RATE LIMITING (Cloud-Lockdown) ===
  // Extract client IP from X-Forwarded-For or fallback to connection info
  const forwarded = req.headers.get("x-forwarded-for");
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  
  const rateLimitCheck = checkRateLimit(clientIp);
  if (!rateLimitCheck.allowed) {
    console.error(`[RATE LIMIT] IP ${clientIp} exceeded limit`);
    const response: ErrorResponse = createErrorResponse(
      `Rate limit exceeded. Retry after ${rateLimitCheck.retryAfter}s`,
      "RATE_LIMIT_EXCEEDED"
    );
    return new Response(JSON.stringify(response), {
      status: 429,
      headers: {
        ...corsHeaders,
        "Retry-After": String(rateLimitCheck.retryAfter),
      },
    });
  }

  // Verify Bearer Token (Cloud-Lockdown)
  const authCheck = verifyBearerToken(req);
  if (!authCheck.valid) {
    const response: ErrorResponse = createErrorResponse(authCheck.error, authCheck.code);
    return new Response(JSON.stringify(response), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    // Parse JSON body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      console.error("[PAYLOAD] JSON parse error from origin:", origin || "unknown");
      const response: ErrorResponse = createErrorResponse("Invalid JSON in request body", "JSON_PARSE_ERROR");
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Validate + normalize payload
    const validation = normalizePayload(body);
    if (!validation.valid) {
      console.error(`[PAYLOAD] Validation failed: ${validation.error} (code: ${validation.code})`);
      const response: ErrorResponse = createErrorResponse(validation.error, validation.code);
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Database Insert - Cloud-Lockdown
    const supabase = getSupabaseAdmin();
    const originalBody = isRecord(body) ? body : {};

    const dbRecord: Omit<DatabaseRecord, "id"> = {
      timestamp: validation.data.timestamp,
      source: validation.data.source,
      sentiment_score: validation.data.sentiment_score,
      verdict: validation.data.verdict,
      raw_data: {
        ...originalBody,
        _signal_v2: {
          timestamp: validation.data.timestamp,
          source: validation.data.source,
          signal_type: validation.data.signal_type,
          normalized_score: validation.data.normalized_score,
          verdict: validation.data.verdict,
          confidence: validation.data.confidence,
          summary: validation.data.summary,
          dimensions: validation.data.dimensions,
          metadata: validation.data.metadata,
        },
        _compat: {
          sentiment_score: validation.data.sentiment_score,
          signal_type: validation.data.signal_type,
          legacy_table: "market_sentiment",
        },
      },
    };

    const { data: insertedData, error: dbError } = await supabase
      .from("market_sentiment")
      .insert(dbRecord)
      .select("id")
      .single();

    if (dbError) {
      console.error("[DATABASE] Insert error:", dbError);
      const response: ErrorResponse = createErrorResponse(
        `Database error: ${dbError.message}`,
        "DB_INSERT_ERROR"
      );
      return new Response(JSON.stringify(response), {
        status: 500,
        headers: corsHeaders,
      });
    }

    console.log(`[SUCCESS] Record inserted: ${insertedData.id} from source: ${validation.data.source}`);

    // Return success with database ID
    const response: SuccessResponse = createSuccessResponse(
      validation.data,
      insertedData.id
    );
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[CRITICAL] Edge function error:", err);
    const response: ErrorResponse = createErrorResponse(`Internal error: ${errorMessage}`, "INTERNAL_ERROR");
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
