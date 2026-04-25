import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-mbrn-admin-token",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
  const adminToken = Deno.env.get("MBRN_FACTORY_ADMIN_TOKEN");

  if (req.method === "POST") {
    if (adminToken && req.headers.get("x-mbrn-admin-token") !== adminToken) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const body = await req.json().catch(() => ({}));
    const value = Boolean(body.factory_paused);
    const { error } = await supabase
      .from("factory_flags")
      .upsert({ key: "factory_paused", value, updated_at: new Date().toISOString() });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const { data, error } = await supabase
    .from("factory_flags")
    .select("value,updated_at")
    .eq("key", "factory_paused")
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    factory_paused: Boolean(data?.value),
    updated_at: data?.updated_at ?? null,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

