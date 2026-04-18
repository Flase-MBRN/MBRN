// MBRN-HUB-V1: Pillar 2 - B2B COMMERCIAL API (THE GOLDESEL)
// Supabase Edge Function: mbrn_compute
// Phase 6.0 - SaaS Architecture

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Dynamic routing to MBRN Core Logic via relative paths
// Supabase CLI natively bundles these ES6 files upon deployment
import { calculateChronos } from "../../../shared/core/logic/chronos_v2.js";
import { getUnifiedProfile } from "../../../shared/core/logic/orchestrator.js";
import { calculateSynergy } from "../../../shared/core/logic/synergy.js";
import { calculateNameFrequency } from "../../../shared/core/logic/frequency.js";

// CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-mbrn-api-key",
  "Content-Type": "application/json",
};

// Response Wrapper standardized format
function createResponse(success: boolean, data: any, errorMsg?: string, statusCode = 200) {
  const payload = {
    success,
    metadata: {
      timestamp_utc: new Date().toISOString(),
      engine: "MBRN-V1-Deno",
    },
    [success ? 'result' : 'error']: success ? data : errorMsg
  };

  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: corsHeaders,
  });
}

serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return createResponse(false, null, "Method not allowed. Use POST.", 405);
  }

  // 2. SECURITY VALIDATION: The Goldesel Gatekeeper
  const incomingApiKey = req.headers.get("x-mbrn-api-key");
  const masterKey = Deno.env.get("B2B_MASTER_KEY");

  // If no master key is set in cloud environment, fail securely
  if (!masterKey) {
    console.error("[CRITICAL] B2B_MASTER_KEY environment variable is not set!");
    return createResponse(false, null, "Internal Server Configuration Error.", 500);
  }

  if (!incomingApiKey || incomingApiKey !== masterKey) {
    return createResponse(false, null, "Unauthorized: Invalid x-mbrn-api-key", 401);
  }

  // 3. PARSE PAYLOAD
  try {
    const body = await req.json();
    const service = body.service?.toLowerCase();
    const data = body.data || {};

    if (!service) {
      return createResponse(false, null, "Missing 'service' key in payload.", 400);
    }

    const startTime = performance.now();
    let computeResult: any = null;

    // 4. ROUTE TO ENGINE
    switch (service) {
      case "chronos":
        if (!data.birthdate && !data.birthDate) {
          return createResponse(false, null, "Chronos requires 'birthdate'", 400);
        }
        computeResult = await calculateChronos(data.birthdate || data.birthDate);
        break;

      case "numerology":
        if (!data.name || (!data.birthdate && !data.birthDate)) {
          return createResponse(false, null, "Numerology requires 'name' and 'birthdate'", 400);
        }
        computeResult = await getUnifiedProfile(data.name, data.birthdate || data.birthDate);
        break;

      case "synergy":
        if (!data.operatorA || !data.operatorB) {
          return createResponse(false, null, "Synergy requires 'operatorA' and 'operatorB' objects", 400);
        }
        computeResult = await calculateSynergy(data.operatorA, data.operatorB);
        break;

      case "tuning":
        if (!data.name) {
          return createResponse(false, null, "Tuning requires 'name'", 400);
        }
        computeResult = calculateNameFrequency(data.name);
        break;

      default:
        return createResponse(false, null, `Unknown service: ${service}`, 404);
    }

    // Measure performance
    const endTime = performance.now();
    const processTimeMs = Math.round(endTime - startTime);

    // If a service fails payload validation internally, handle it securely
    if (computeResult && typeof computeResult === 'object' && computeResult.success === false) {
       return createResponse(false, null, computeResult.error || "Computation failed internally.", 400);
    }

    // 5. SUCCESS RESPOND
    return new Response(JSON.stringify({
      success: true,
      metadata: {
        timestamp_utc: new Date().toISOString(),
        engine: "MBRN-V1-Deno",
        compute_time_ms: processTimeMs
      },
      result: computeResult
    }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (err: any) {
    console.error("[COMPUTE ERROR]", err);
    return createResponse(false, null, `Payload Parse or Compute Error: ${err.message}`, 500);
  }
});
